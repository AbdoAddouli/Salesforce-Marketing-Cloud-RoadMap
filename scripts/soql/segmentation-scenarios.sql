-- Segmentation and deliverability scenarios.
-- Run with: sf data query --file scripts/soql/segmentation-scenarios.sql
-- Every query here answers a question a Marketing Cloud user actually asks,
-- expressed against the grain that can answer it.

-- 1. How many marketing contacts has each person had in the last 30 days?
--    Counted from the interaction grain. A count of campaign members cannot
--    answer a per-contact question, which is the usual reason a frequency cap
--    in Journey Builder and a cap in a segment never agree.
SELECT Contact__c,
       COUNT(Id)                              AS Marketing_Contacts_30d,
       MAX(InteractionDate__c)                 AS Last_Contacted
FROM   Marketing_Interaction__c
WHERE  Marketing__c = true
AND    InteractionDate__c = LAST_N_DAYS:30
GROUP  BY Contact__c
HAVING COUNT(Id) >= 4
ORDER  BY Marketing_Contacts_30d DESC
LIMIT  100;

-- 2. Who is sendable on email right now?
--    Note the subquery: consent is a child record, so a filter on the parent
--    cannot express "has opted in" without it.
SELECT  Id, Email__c, FirstName__c, LastName__c, TimeZone_Offset__c
FROM    Contact_Master__c
WHERE   Duplicate_Flag__c = false
AND     DoNotMarket__c = false
AND     Id IN (
            SELECT Contact__c
            FROM   Consent_Preference__c
            WHERE  Channel__c = 'Email'
            AND    Purpose__c = 'Marketing'
            AND    Status__c = 'OptedIn'
        )
ORDER BY LastName__c
LIMIT   200;

-- 3. Consent that is held by one source and contradicted by another.
--    This is the reconciliation queue. Every row here needs a human decision,
--    and the correct default is the opt-out, not the most recent record.
SELECT  Contact__c, Channel__c, Purpose__c,
        COUNT(Id)                          AS Source_Count,
        MIN(CapturedDate__c)               AS First_Captured,
        MAX(CapturedDate__c)               AS Last_Captured
FROM    Consent_Preference__c
WHERE   Is_Tombstone__c = false
GROUP   BY Contact__c, Channel__c, Purpose__c
HAVING   COUNT(Id) > 1
AND      COUNT(DISTINCT Status__c) > 1
ORDER   BY Contact__c;

-- 4. Why were journey entries blocked?
--    The blocked-decision breakdown. A rising count here points at a consent
--    source that stopped syncing, a cap that became too tight, or a journey
--    pointed at the wrong population, and the send rate shows none of them.
SELECT  Journey__c, Reason__c,
        COUNT(Id)                          AS Blocked_Entries,
        MAX(EvaluatedAt__c)                AS Most_Recent
FROM    Journey_Entry_Log__c
WHERE   Decision__c = 'Blocked'
AND     EvaluatedAt__c = LAST_N_DAYS:7
GROUP   BY Journey__c, Reason__c
ORDER   BY Blocked_Entries DESC
LIMIT   25;

-- 5. Import health: which runs came in short, and by how much?
--    Row-count variance against the previous successful run is the earliest
--    available signal that a file is partial. Yesterday's number alone is not
--    enough, because a legitimately quiet day is not a broken file.
SELECT   SourceSystem__c,
         Status__c,
         AVG(RecordsOut__c)                AS Avg_Rows_Out,
         MIN(RecordsOut__c)                AS Min_Rows_Out,
         MAX(RecordsOut__c)                AS Max_Rows_Out,
         COUNT(Id)                         AS Runs
FROM     Data_Extension_Sync_Log__c
WHERE    ValidatedAt__c = LAST_N_DAYS:30
GROUP    BY SourceSystem__c, Status__c
ORDER    BY SourceSystem__c, Status__c;

-- 6. Soft bounces against hard bounces, separated.
--    Suppressing on soft bounce is the fastest way to shrink an addressable
--    audience for no reason, so the two are never summed together.
SELECT  Channel__c, InteractionType__c, COUNT(Id) AS Interactions
FROM    Marketing_Interaction__c
WHERE   InteractionDate__c = LAST_N_DAYS:30
AND     InteractionType__c IN ('Complaint', 'Unsubscribe')
GROUP   BY Channel__c, InteractionType__c
ORDER   BY Channel__c, InteractionType__c;

-- 7. Segment size with an explicit staleness check.
--    A calculated insight is only current while the rule behind it is still
--    true, so the recalculation timestamp is part of the definition.
SELECT  Name, Segment_Change_Values__c, LastCalculatedDate__c
FROM    Segment__mdt
ORDER BY LastCalculatedDate__c ASC NULLS FIRST
LIMIT   25;
