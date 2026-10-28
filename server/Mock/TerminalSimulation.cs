using EmptyingMonitor.Api.Models;

namespace EmptyingMonitor.Api.Mock;

/// <summary>
/// In-memory stand-in for the real terminal feed. No database, no external call:
/// a fixed opening scenario plus a state machine that walks a couple of
/// containers one stage forward every few seconds. Everything here is fabricated.
/// </summary>
public sealed class TerminalSimulation
{
    private const int LanesPerArea = 10;
    private const int YardCapacity = 27;
    private const int ClearedCapacity = 12;
    /// הערוגה מחזיקה את יציאות היום, והמספר הזה הוא רק בלם לפרוטוטיפ:
    /// הסימולציה מריצה יום שלם בדקות, ובלי תקרה הערוגה היתה מגיעה
    /// למאות מכולות תוך שעה. מול נתונים אמיתיים סינון היום הוא הכלל היחיד.
    private const int DepartedCapacity = 16;
    private const int WorkOrderCapacity = 14;

    /// One shared clock, matching the client's. Every rate on both sides is a
    /// multiple of the same 60ms unit; the feed advances every 64 of them.
    private static readonly TimeSpan TickInterval = TimeSpan.FromMilliseconds(64 * 60);

    private readonly Lock _gate = new();
    private readonly Random _rng = new(51853);

    private readonly List<ContainerCard> _expectedUnescorted = [];
    private readonly List<ContainerCard> _expectedEscorted = [];
    private readonly List<ContainerCard> _workOrder = [];
    private readonly List<ContainerCard> _yard = [];
    private readonly ContainerCard?[] _areaA = new ContainerCard?[LanesPerArea];
    private readonly ContainerCard?[] _areaB = new ContainerCard?[LanesPerArea];
    private readonly List<ContainerCard> _cleared = [];

    /// רוקנו ויצאו מהמסוף. הרשימה הזו היא היסטוריה קצרה: המכולות
    /// כבר אינן על השטח, והן נשמרות כדי שאפשר יהיה להגיד מתי יצאו.
    private readonly List<ContainerCard> _departed = [];

    /// <summary>
    /// The deals inside each container, keyed by container number. Kept here
    /// rather than on the card so one copy stays authoritative: the four figures
    /// on a card are summed from these lines every time a snapshot is built,
    /// which makes it impossible for a card and its deal list to disagree.
    /// </summary>
    private readonly Dictionary<string, List<DealLine>> _deals =
        new(StringComparer.OrdinalIgnoreCase);

    private DateTimeOffset _lastTick = DateTimeOffset.MinValue;
    private int _damageOrdersOpen = 2;
    private int _serial;

    private static readonly string[] OwnerPrefixes =
        ["ZLDU", "KRMU", "NVSU", "ARTU", "HLDU", "QSBU", "VRNU", "TMLU"];

    // סוכני אוניה, אחד לכל קידומת בעלות ובאותו סדר. סוכן מייצג קו ספנות,
    // ולכן הוא נגזר מהמכולה ולא מוגרל בנפרד: אותה קידומת תיתן תמיד אותו סוכן.
    // שתי האחרונות חולקות סוכן אחד, כפי שקורה כשסוכנות אחת מייצגת שני קווים.
    private static readonly string[] ShippingAgents =
    [
        "דולפין סוכנויות ספנות",
        "ענבר סוכנות אוניות",
        "מגדלור שיפינג",
        "קשת ים סוכנויות",
        "אופק ספנות בע\"מ",
        "לביא סוכנות אוניות",
        "צוק הים סוכנויות",
        "צוק הים סוכנויות"
    ];

    private static readonly string[] Customers =
    [
        "אלון שינוע בע\"מ",
        "דגן סחר ויבוא",
        "ק.ל.ש לוגיסטיקה",
        "מרכז היבוא הנגב",
        "אורלוג ים בע\"מ",
        "שחם הפצה ארצית",
        "גלעד טרנס",
        "מ.ת.ן יבוא כללי",
        "נמרוד עמילות מכס",
        "בר-כוכבא שילוח"
    ];

    // משלחים בינלאומיים. רשימה קצרה משל הלקוחות בכוונה: משלח אחד
    // מביא מכולות עבור כמה לקוחות, וזה מה שעושה את החיפוש לפי משלח שימושי.
    private static readonly string[] Shippers =
    [
        "כרמל שילוח בינלאומי",
        "תבור לוגיסטיקה ימית",
        "אשד קרגו",
        "נווה שילוח בע\"מ",
        "גל-ים פורוורדינג",
        "רימון שילוח ימי ואווירי",
        "שדות שילוח בינלאומי"
    ];

    // תיאורי מטען. בנתונים אמיתיים זה טקסט חופשי משורת האריזה.
    private static readonly string[] Cargoes =
    [
        "רהיטים מפורקים",
        "מוצרי חשמל ביתיים",
        "חלקי חילוף לרכב",
        "אריחי קרמיקה",
        "מוצרי פלסטיק",
        "טקסטיל ובגדים",
        "כלי עבודה ידניים",
        "מזון יבש ארוז",
        "צעצועים",
        "ציוד משרדי",
        "צינורות PVC",
        "נייר ואריזות קרטון",
        "מכשור רפואי",
        "חומרי בניין ארוזים"
    ];

    private static readonly string[] Drivers =
    [
        "איתי ברזילי", "ראמי חורי", "ולדימיר סמוליאנוב", "יוסי אבוקסיס",
        "ח'אלד מנסור", "ניר שטיינברג", "אמיר דהן", "סרגיי קובלנקו"
    ];

    public TerminalSimulation() => Seed();

    private void Seed()
    {
        for (var i = 0; i < 18; i++)
            _expectedUnescorted.Add(NewContainer(ContainerStatus.ExpectedUnescorted, null, 0.08));
        for (var i = 0; i < 7; i++)
            _expectedEscorted.Add(NewContainer(ContainerStatus.ExpectedEscorted, null, 0.30));
        for (var i = 0; i < 11; i++)
            _workOrder.Add(NewContainer(ContainerStatus.WorkOrderIssued, null, 0.18));

        var openingA = new[]
        {
            ContainerStatus.PlacedUnopened, ContainerStatus.PlacedUnopened, null,
            ContainerStatus.Emptying, ContainerStatus.Emptying, ContainerStatus.Emptying,
            null, null, ContainerStatus.EmptiedInLane, ContainerStatus.EmptiedInLane
        };
        var openingB = new[]
        {
            ContainerStatus.PlacedUnopened, null, ContainerStatus.PlacedUnopened, null,
            ContainerStatus.Emptying, ContainerStatus.EmptiedInLane, null, null,
            ContainerStatus.Emptying, ContainerStatus.EmptiedInLane
        };

        for (var i = 0; i < LanesPerArea; i++)
        {
            if (openingA[i] is { } a) _areaA[i] = NewContainer(a, $"A-{i + 1}", 0.45);
            if (openingB[i] is { } b) _areaB[i] = NewContainer(b, $"B-{i + 1}", 0.35);
        }

        for (var i = 0; i < YardCapacity; i++)
            _yard.Add(NewContainer(ContainerStatus.AtTerminal, null, 0.11));

        for (var i = 0; i < ClearedCapacity; i++)
            _cleared.Add(NewContainer(ContainerStatus.Cleared, null, 0.14));

        // Everything on the departed bed left today, so it opens with this
        // morning's departures rather than with a week of them. The emptying
        // times behind them can still fall on yesterday, which is what makes
        // the dated stamps worth showing.
        var sinceMidnight = Math.Max(90, (int)(DateTimeOffset.Now - DateTimeOffset.Now.Date).TotalMinutes);
        for (var i = 0; i < 9; i++)
            _departed.Add(NewContainer(ContainerStatus.DepartedTerminal, null, 0.05,
                minutesBack: _rng.Next(15, sinceMidnight)));
        _departed.Sort((a, b) => (b.DepartedAt ?? b.UpdatedAt).CompareTo(a.DepartedAt ?? a.UpdatedAt));
    }

    private ContainerCard NewContainer(
        string status,
        string? position,
        double urgentChance,
        int? minutesBack = null)
    {
        _serial++;
        var owner = _rng.Next(OwnerPrefixes.Length);
        var prefix = OwnerPrefixes[owner];
        var body = _rng.Next(100000, 999999);
        var check = (_serial * 7 + body) % 10;

        // High cubes and reefers are overwhelmingly forties; a 20ft high cube is
        // a rare box, so the type is drawn conditionally on the length.
        var sizeFeet = _rng.NextDouble() < 0.66 ? 40 : 20;
        var roll = _rng.NextDouble();
        var typeCode = sizeFeet == 40
            ? roll < 0.45 ? "RG" : roll < 0.85 ? "HC" : "RH"
            : roll < 0.85 ? "RG" : "RH";

        var hasDriver = status is ContainerStatus.WorkOrderIssued or ContainerStatus.ExpectedEscorted;
        var containerNumber = $"{prefix} {body} {check}";

        var updatedAt = DateTimeOffset.Now.AddMinutes(-(minutesBack ?? _rng.Next(3, 260)));

        // A container that has been emptied carries the moment it finished, and
        // one that has left the terminal carries its exit on top of that. The
        // emptying always precedes the exit, because it did.
        var emptied = status is ContainerStatus.EmptiedInLane
            or ContainerStatus.Cleared
            or ContainerStatus.DepartedTerminal;
        DateTimeOffset? emptiedAt = emptied
            ? updatedAt.AddMinutes(-_rng.Next(25, 600))
            : null;
        DateTimeOffset? departedAt = status == ContainerStatus.DepartedTerminal ? updatedAt : null;

        _deals[containerNumber] = NewDeals(status, updatedAt);

        return new ContainerCard(
            ContainerNumber: containerNumber,
            Shipper: Shippers[_rng.Next(Shippers.Length)],
            ShippingAgent: ShippingAgents[owner],
            // Six digits, the first two being the year the manifest was opened.
            // Taken from the clock rather than hardcoded, so it stays right.
            ManifestNumber: $"{DateTimeOffset.Now.Year % 100:D2}{_rng.Next(0, 10000):D4}",
            // Forties outnumber twenties on a modern terminal, roughly two to one.
            SizeFeet: sizeFeet,
            TypeCode: typeCode,
            Status: status,
            Customer: Customers[_rng.Next(Customers.Length)],
            Urgent: _rng.NextDouble() < urgentChance,
            UpdatedAt: updatedAt,
            Position: position,
            Driver: hasDriver ? Drivers[_rng.Next(Drivers.Length)] : null,
            EmptiedAt: emptiedAt,
            DepartedAt: departedAt
        );
    }

    /// <summary>
    /// The deals in one container. Packages are split unevenly between them on
    /// purpose: a container holding one big consignment and three small ones is
    /// the normal case, and an even split would make the percentage meaningless.
    /// </summary>
    private List<DealLine> NewDeals(string status, DateTimeOffset updatedAt)
    {
        var emptiedAlready = status is ContainerStatus.EmptiedInLane
            or ContainerStatus.Cleared
            or ContainerStatus.DepartedTerminal;

        // Availability is transmitted per deal as the cargo becomes collectable,
        // so a container still waiting at the gate has few, and one that has been
        // emptied has nearly all of them.
        var transmitChance = status switch
        {
            ContainerStatus.EmptiedInLane or ContainerStatus.Cleared
                or ContainerStatus.DepartedTerminal => 0.94,
            ContainerStatus.Emptying => 0.55,
            ContainerStatus.PlacedUnopened => 0.3,
            ContainerStatus.AtTerminal => 0.15,
            _ => 0.05
        };

        var count = _rng.Next(2, 7);
        var lines = new List<DealLine>(count);

        for (var i = 0; i < count; i++)
        {
            var packages = _rng.Next(1, 4) == 1 ? _rng.Next(6, 15) : _rng.Next(1, 6);
            var transmitted = _rng.NextDouble() < transmitChance;
            // Weight follows the count, with a spread: a pallet of tiles and a
            // pallet of toys are the same package and nothing like the same load.
            var perPackage = _rng.Next(40, 950);

            lines.Add(new DealLine(
                // Seventeen characters, the shape the real מזהה עסקה is
                // documented to have. Every digit here is invented.
                DealId: $"{DateTimeOffset.Now.Year}{_rng.NextInt64(0, 10_000_000_000_000L):D13}",
                Shipper: Shippers[_rng.Next(Shippers.Length)],
                Cargo: Cargoes[_rng.Next(Cargoes.Length)],
                WeightKg: packages * perPackage,
                Packages: packages,
                PackagesEmptied: emptiedAlready ? packages : 0,
                AvailabilityTransmitted: transmitted,
                AvailabilityAt: transmitted ? updatedAt.AddMinutes(-_rng.Next(5, 400)) : null
            ));
        }

        return lines;
    }

    /// <summary>
    /// Fills a card's four deal figures from the authoritative deal lines. Every
    /// card handed out by this class goes through here.
    /// </summary>
    private ContainerCard Hydrate(ContainerCard card)
    {
        if (!_deals.TryGetValue(card.ContainerNumber, out var lines)) return card;

        return card with
        {
            Packages = lines.Sum(l => l.Packages),
            PackagesEmptied = lines.Sum(l => l.PackagesEmptied),
            DealCount = lines.Count,
            DealsWithAvailability = lines.Count(l => l.AvailabilityTransmitted)
        };
    }

    private IReadOnlyList<ContainerCard> HydrateAll(IEnumerable<ContainerCard> cards) =>
        [.. cards.Select(Hydrate)];

    public ContainerDeals? GetDeals(string containerNumber)
    {
        lock (_gate)
        {
            Tick();
            if (!_deals.TryGetValue(containerNumber, out var lines)) return null;

            return new ContainerDeals(
                ContainerNumber: containerNumber,
                Packages: lines.Sum(l => l.Packages),
                PackagesEmptied: lines.Sum(l => l.PackagesEmptied),
                Deals: [.. lines],
                GeneratedAt: DateTimeOffset.Now
            );
        }
    }

    public FloorSnapshot GetFloor()
    {
        lock (_gate)
        {
            Tick();
            return new FloorSnapshot(
                AreaA: new EmptyingArea("A", BuildLanes(_areaA)),
                AreaB: new EmptyingArea("B", BuildLanes(_areaB)),
                Yard: HydrateAll(_yard),
                ClearedYard: HydrateAll(_cleared),
                Departed: HydrateAll(_departed),
                GeneratedAt: DateTimeOffset.Now
            );
        }
    }

    public FlowSnapshot GetFlow()
    {
        lock (_gate)
        {
            Tick();

            var inLane = _areaA.Concat(_areaB).OfType<ContainerCard>().ToList();
            var placed = inLane.Where(c => c.Status == ContainerStatus.PlacedUnopened).ToList();
            var emptying = inLane.Where(c => c.Status == ContainerStatus.Emptying).ToList();
            var emptied = inLane.Where(c => c.Status == ContainerStatus.EmptiedInLane).ToList();

            var progress = inLane.Count == 0
                ? 0
                : Math.Round((emptied.Count + emptying.Count * 0.5) / inLane.Count * 100, 1);

            var identified = _yard.Count + inLane.Count;
            const int pendingId = 4;
            const int mismatchId = 1;

            return new FlowSnapshot(
                Stages:
                [
                    Stage("expected_unescorted", "צפויות לכניסה, ללא ליווי", "מוכרזות, טרם נמסר סידור", _expectedUnescorted),
                    Stage("expected_escorted", "צפויות לכניסה, עם ליווי", "מחייבות ליווי בשער", _expectedEscorted),
                    Stage("work_order_issued", "נמסר סידור עבודה לנהג", "ממתינות בשער", _workOrder),
                    Stage("at_terminal", "נכנסו למסוף לריקון", "ממתינות לשיבוץ", _yard),
                    Stage("placed_unopened", "הוצבה בשטח ריקון", "טרם נפתחה", placed),
                    Stage("emptying", "ריקון פעיל", "בעבודה עכשיו", emptying,
                    [
                        new StageMeasure("progress", "התקדמות הריקון", "pct", progress,
                            "מתוך המכולות העומדות בשטחי הריקון", null),
                        new StageMeasure("uptime", "שידור זמינות", "pct", 97.3,
                            "קליטת דיווחים מהשטח", "ערך קבוע להדגמה, טרם הוגדר מקור נתונים"),
                        new StageMeasure("damage", "סידורים עם נזק", "count", _damageOrdersOpen,
                            "פתוחים בטיפול תפעול", null),
                        new StageMeasure("cargo_id", "זיהוי מטענים", "count", pendingId + mismatchId,
                            $"{pendingId} ממתינות לזיהוי, {mismatchId} באי התאמה מתוך {identified}", null)
                    ]),
                    Stage("emptied_in_lane", "רוקנה", "עדיין בשטח הריקון", emptied),
                    Stage("cleared", "יצאה משטח הריקון", "פינתה את הנתיב", _cleared),
                    Stage("departed_terminal", "יצאה מהמסוף", "רוקנה ועזבה את המסוף", _departed)
                ],
                GeneratedAt: DateTimeOffset.Now
            );
        }
    }

    private FlowStage Stage(
        string key,
        string name,
        string note,
        IReadOnlyList<ContainerCard> containers,
        IReadOnlyList<StageMeasure>? measures = null) =>
        new(key, name, note, containers.Count, containers.Count(c => c.Urgent),
            HydrateAll(containers), measures ?? []);

    /// <summary>
    /// Sets or clears the urgency flag on named containers wherever they stand,
    /// so a container marked in a bay is still marked once it reaches the
    /// cleared bed. Returns how many actually changed.
    /// </summary>
    public int SetUrgent(IReadOnlyCollection<string> containerNumbers, bool urgent)
    {
        lock (_gate)
        {
            var wanted = new HashSet<string>(containerNumbers, StringComparer.OrdinalIgnoreCase);
            if (wanted.Count == 0) return 0;

            var now = DateTimeOffset.Now;
            var changed = 0;

            void ApplyToList(List<ContainerCard> list)
            {
                for (var i = 0; i < list.Count; i++)
                {
                    var c = list[i];
                    if (c.Urgent == urgent || !wanted.Contains(c.ContainerNumber)) continue;
                    list[i] = c with { Urgent = urgent, UpdatedAt = now };
                    changed++;
                }
            }

            void ApplyToArea(ContainerCard?[] area)
            {
                for (var i = 0; i < area.Length; i++)
                {
                    if (area[i] is not { } c) continue;
                    if (c.Urgent == urgent || !wanted.Contains(c.ContainerNumber)) continue;
                    area[i] = c with { Urgent = urgent, UpdatedAt = now };
                    changed++;
                }
            }

            ApplyToList(_expectedUnescorted);
            ApplyToList(_expectedEscorted);
            ApplyToList(_workOrder);
            ApplyToList(_yard);
            ApplyToList(_cleared);
            ApplyToList(_departed);
            ApplyToArea(_areaA);
            ApplyToArea(_areaB);

            return changed;
        }
    }

    private IReadOnlyList<Lane> BuildLanes(ContainerCard?[] area) =>
        [.. area.Select((c, i) => new Lane(i + 1, c is null ? null : Hydrate(c)))];

    /// <summary>
    /// Walks containers one stage forward along the confirmed flow:
    /// expected -> work order -> entered -> placed -> emptying -> emptied -> departed.
    /// </summary>
    private void Tick()
    {
        var now = DateTimeOffset.Now;
        if (now - _lastTick < TickInterval) return;
        _lastTick = now;

        AdvanceLanes(now);
        AdvanceGate(now);
        AdvanceEmptyingProgress(now);
        DropYesterdaysDepartures(now);

        if (_rng.NextDouble() < 0.06)
            _damageOrdersOpen = Math.Min(9, _damageOrdersOpen + 1);
        else if (_damageOrdersOpen > 1 && _rng.NextDouble() < 0.04)
            _damageOrdersOpen--;
    }

    /// <summary>
    /// Emptying is a process, not an instant: while a container stands in a bay
    /// with the emptying status, its packages come off a few at a time, and
    /// availability goes out deal by deal as each consignment becomes collectable.
    ///
    /// The count deliberately stops one package short of the total. A container
    /// reads as fully emptied only when its status says so, so the figure in the
    /// plate and the paint on the face can never contradict each other.
    /// </summary>
    private void AdvanceEmptyingProgress(DateTimeOffset now)
    {
        foreach (var area in new[] { _areaA, _areaB })
        {
            foreach (var card in area)
            {
                if (card is not { Status: ContainerStatus.Emptying }) continue;
                if (!_deals.TryGetValue(card.ContainerNumber, out var lines)) continue;

                var room = lines.Sum(l => l.Packages) - 1 - lines.Sum(l => l.PackagesEmptied);
                var step = Math.Min(Math.Max(room, 0), _rng.Next(1, 4));

                for (var i = 0; i < lines.Count && step > 0; i++)
                {
                    var take = Math.Min(step, lines[i].Packages - lines[i].PackagesEmptied);
                    if (take <= 0) continue;
                    lines[i] = lines[i] with { PackagesEmptied = lines[i].PackagesEmptied + take };
                    step -= take;
                }

                if (_rng.NextDouble() >= 0.25) continue;
                var pending = lines.FindIndex(l => !l.AvailabilityTransmitted);
                if (pending >= 0)
                    lines[pending] = lines[pending] with
                    {
                        AvailabilityTransmitted = true,
                        AvailabilityAt = now
                    };
            }
        }
    }

    /// Every package is off once the container's status says it is emptied.
    private void CompleteEmptying(string containerNumber)
    {
        if (!_deals.TryGetValue(containerNumber, out var lines)) return;
        for (var i = 0; i < lines.Count; i++)
            lines[i] = lines[i] with { PackagesEmptied = lines[i].Packages };
    }

    /// <summary>
    /// The departed bed is a day's worth of exits, so at midnight it empties
    /// itself rather than carrying yesterday's containers into today's board.
    /// </summary>
    private void DropYesterdaysDepartures(DateTimeOffset now) =>
        _departed.RemoveAll(c => (c.DepartedAt ?? c.UpdatedAt).Date != now.Date);

    private void AdvanceLanes(DateTimeOffset now)
    {
        for (var step = 0; step < 2; step++)
        {
            var area = _rng.Next(2) == 0 ? _areaA : _areaB;
            var letter = ReferenceEquals(area, _areaA) ? "A" : "B";
            var lane = _rng.Next(LanesPerArea);
            var current = area[lane];

            if (current is null)
            {
                if (_yard.Count == 0) continue;
                var next = _yard[0];
                _yard.RemoveAt(0);
                area[lane] = next with
                {
                    Status = ContainerStatus.PlacedUnopened,
                    Position = $"{letter}-{lane + 1}",
                    UpdatedAt = now
                };
                continue;
            }

            switch (current.Status)
            {
                case ContainerStatus.PlacedUnopened:
                    area[lane] = current with { Status = ContainerStatus.Emptying, UpdatedAt = now };
                    break;

                case ContainerStatus.Emptying:
                    CompleteEmptying(current.ContainerNumber);
                    area[lane] = current with
                    {
                        Status = ContainerStatus.EmptiedInLane,
                        EmptiedAt = now,
                        UpdatedAt = now
                    };
                    break;

                case ContainerStatus.EmptiedInLane:
                    _cleared.Insert(0, current with
                    {
                        Status = ContainerStatus.Cleared,
                        Position = null,
                        UpdatedAt = now
                    });
                    // The oldest container on the cleared bed does not vanish;
                    // it drives out of the gate, and that is its exit time.
                    if (_cleared.Count > ClearedCapacity)
                    {
                        var leaving = _cleared[^1];
                        _cleared.RemoveAt(_cleared.Count - 1);
                        _departed.Insert(0, leaving with
                        {
                            Status = ContainerStatus.DepartedTerminal,
                            DepartedAt = now,
                            UpdatedAt = now
                        });
                        if (_departed.Count > DepartedCapacity)
                            _departed.RemoveAt(_departed.Count - 1);
                    }
                    area[lane] = null;
                    break;
            }
        }
    }

    private void AdvanceGate(DateTimeOffset now)
    {
        // Work order issued -> through the gate into the yard.
        if (_workOrder.Count > 0 && _yard.Count < YardCapacity)
        {
            var arriving = _workOrder[0];
            _workOrder.RemoveAt(0);
            _yard.Add(arriving with
            {
                Status = ContainerStatus.AtTerminal,
                UpdatedAt = now,
                // The driver has left the gate; from here the container is ours.
                Driver = null
            });
        }

        // Expected -> work order handed to a driver. Capped: the gate only holds
        // so many trucks, and an uncapped queue here grows without bound once the
        // yard is full, which swamps the route rail on a board left running.
        var source = _rng.NextDouble() < 0.7 ? _expectedUnescorted : _expectedEscorted;
        if (_workOrder.Count < WorkOrderCapacity && source.Count > 0)
        {
            var booked = source[0];
            source.RemoveAt(0);
            _workOrder.Add(booked with
            {
                Status = ContainerStatus.WorkOrderIssued,
                UpdatedAt = now,
                Driver = Drivers[_rng.Next(Drivers.Length)]
            });
        }

        // New announcements keep the head of the pipeline alive.
        if (_expectedUnescorted.Count < 22 && _rng.NextDouble() < 0.75)
            _expectedUnescorted.Add(NewContainer(ContainerStatus.ExpectedUnescorted, null, 0.08));
        if (_expectedEscorted.Count < 10 && _rng.NextDouble() < 0.35)
            _expectedEscorted.Add(NewContainer(ContainerStatus.ExpectedEscorted, null, 0.30));
    }
}
