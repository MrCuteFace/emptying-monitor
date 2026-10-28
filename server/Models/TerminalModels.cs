namespace EmptyingMonitor.Api.Models;

/// <summary>
/// One status per stage of the confirmed flow. The last five also carry the
/// colour legend from the spec; the first three happen before a container is
/// anywhere on the floor, so they have no colour on the yard.
/// </summary>
public static class ContainerStatus
{
    /// צפויה לכניסה, ללא ליווי
    public const string ExpectedUnescorted = "expected_unescorted";

    /// צפויה לכניסה, עם ליווי
    public const string ExpectedEscorted = "expected_escorted";

    /// נמסר סידור עבודה לנהג
    public const string WorkOrderIssued = "work_order_issued";

    /// אפור - נכנסה למסוף, ממתינה לשיבוץ
    public const string AtTerminal = "at_terminal";

    /// אדום - הוצבה בשטח ריקון, טרם נפתחה
    public const string PlacedUnopened = "placed_unopened";

    /// צהוב - בתהליך ריקון פעיל
    public const string Emptying = "emptying";

    /// ירוק - רוקנה במלואה, עדיין בשטח
    public const string EmptiedInLane = "emptied_in_lane";

    /// וורוד - יצאה משטח הריקון, עדיין במסוף
    public const string Cleared = "cleared";

    /// כחול - רוקנה ויצאה מהמסוף כולו
    public const string DepartedTerminal = "departed_terminal";
}

public record ContainerCard(
    string ContainerNumber,
    /// המשלח הבינלאומי שהביא את המכולה; הוא מטפל בכמה לקוחות
    string Shipper,
    /// סוכן האוניה: נציג קו הספנות בארץ, נגזר מקידומת הבעלות של המכולה
    string ShippingAgent,
    /// מספר מניפסט, שש ספרות; שתי הראשונות הן השנה
    string ManifestNumber,
    /// אורך המכולה ברגל: 20 או 40
    int SizeFeet,
    /// סוג המכולה: RG רגילה, HC גבוהה, RH מקוררת גבוהה
    string TypeCode,
    string Status,
    string Customer,
    bool Urgent,
    DateTimeOffset UpdatedAt,
    string? Position,
    string? Driver,
    /// מועד סיום הריקון. null עד שהמכולה רוקנה בפועל
    DateTimeOffset? EmptiedAt = null,
    /// מועד היציאה מהמסוף. null כל עוד המכולה בתחום המסוף
    DateTimeOffset? DepartedAt = null,
    /// סך האריזות במכולה, סכום שורות האריזה של כל העסקאות
    int Packages = 0,
    /// כמה מהן כבר ירדו מהמכולה; ממנו נגזר אחוז הריקון
    int PackagesEmptied = 0,
    /// מספר העסקאות שיושבות במכולה
    int DealCount = 0,
    /// כמה מהן שודרה להן זמינות
    int DealsWithAvailability = 0
);

/// <summary>
/// One deal (מזהה עסקה) sitting inside a container. Its 17-character shape follows the real
/// identifier's; every digit, and every figure on it, is invented.
/// </summary>
public record DealLine(
    string DealId,
    string Shipper,
    /// תיאור המטען כפי שהוצהר בשורת האריזה
    string Cargo,
    /// משקל העסקה בק"ג
    int WeightKg,
    int Packages,
    int PackagesEmptied,
    bool AvailabilityTransmitted,
    DateTimeOffset? AvailabilityAt
);

public record ContainerDeals(
    string ContainerNumber,
    int Packages,
    int PackagesEmptied,
    IReadOnlyList<DealLine> Deals,
    DateTimeOffset GeneratedAt
);

public record Lane(int Number, ContainerCard? Container);

public record EmptyingArea(string Name, IReadOnlyList<Lane> Lanes);

public record FloorSnapshot(
    EmptyingArea AreaA,
    EmptyingArea AreaB,
    IReadOnlyList<ContainerCard> Yard,
    IReadOnlyList<ContainerCard> ClearedYard,
    /// רוקנו ויצאו מהמסוף; היסטוריה, לא תמונת מצב של השטח
    IReadOnlyList<ContainerCard> Departed,
    DateTimeOffset GeneratedAt
);

/// <summary>
/// A measure that belongs to one stage rather than to a separate metrics panel.
/// `Source` is null when the number is measured and carries a note when it is not.
/// </summary>
public record StageMeasure(
    string Key,
    string Label,
    string Kind,
    double Value,
    string Detail,
    string? Source
);

public record FlowStage(
    string Key,
    string Name,
    string Note,
    int Count,
    int UrgentCount,
    IReadOnlyList<ContainerCard> Containers,
    IReadOnlyList<StageMeasure> Measures
);

/// <summary>
/// Urgency is the one field this screen writes back. In the real terminal it is
/// set by customer service; here the floor view can set it directly so the
/// prototype can be driven by hand.
/// </summary>
public record UrgentUpdate(IReadOnlyList<string> ContainerNumbers, bool Urgent);

public record FlowSnapshot(
    IReadOnlyList<FlowStage> Stages,
    DateTimeOffset GeneratedAt
);
