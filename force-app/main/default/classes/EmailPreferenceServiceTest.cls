@IsTest
/**
 * EmailPreferenceServiceTest
 *
 * Preference reads, the terminal global unsubscribe, and the bounce taxonomy.
 * The bounce test is the important one: soft bounce is not opt-out.
 */
private class EmailPreferenceServiceTest {
    @TestSetup
    static void seed() {
        insert new Contact_Master__c(Email__c = 'ada@example.com', FirstName__c = 'Ada', LastName__c = 'L');
    }

    private static Id contact() {
        return [SELECT Id FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1].Id;
    }

    @IsTest
    static void transactionalIsAlwaysPermitted() {
        Test.startTest();
        EmailPreferenceService.PreferenceSummary s = EmailPreferenceService.read(contact());
        Test.stopTest();

        Assert.isTrue(s.emailTransactional, 'Transactional mail is exempt from marketing consent.');
        Assert.isFalse(s.emailMarketing, 'Marketing is not permitted until it is granted.');
    }

    @IsTest
    static void readReturnsPreferenceCentreAndUnsubscribeUrls() {
        Test.startTest();
        EmailPreferenceService.PreferenceSummary s = EmailPreferenceService.read(contact());
        Test.stopTest();

        Assert.isTrue(s.preferenceCentreUrl.startsWith('https://'), 'The preference centre is a secure link.');
        Assert.isTrue(s.unsubscribeUrl.contains('unsubscribe'), 'A one-click unsubscribe link is provided.');
    }

    @IsTest
    static void applyingAPreferenceGrantsMarketingConsent() {
        EmailPreferenceService.applyPreference(contact(), 'Marketing', true, 'WebBanner', 'Preference centre');

        Test.startTest();
        EmailPreferenceService.PreferenceSummary s = EmailPreferenceService.read(contact());
        Test.stopTest();

        Assert.isTrue(s.emailMarketing, 'The preference is reflected in the read model.');
        Assert.isFalse(s.globallyUnsubscribed, 'An opt-in is not an opt-out.');
    }

    @IsTest
    static void globalUnsubscribeWritesEveryChannelAndIsTerminal() {
        Test.startTest();
        Integer written = EmailPreferenceService.unsubscribeAll(contact(), 'Global unsubscribe');
        Integer optedOut = [SELECT COUNT() FROM Consent_Preference__c WHERE Contact__c = :contact() AND Status__c = 'OptedOut'];
        Boolean canStillSend = EmailPreferenceService.mayReceiveMarketing(contact());
        Test.stopTest();

        Assert.areEqual(4, written, 'Every promotional channel is written, not only the one clicked.');
        Assert.areEqual(4, optedOut, 'Each channel holds its own opt-out.');
        Assert.isFalse(canStillSend, 'The global unsubscribe is terminal.');
    }

    @IsTest
    static void blockBounceIsTheOnlyConsentEvent() {
        Test.startTest();
        EmailPreferenceService.BounceVerdict block = EmailPreferenceService.classifyBounce(EmailPreferenceService.BOUNCE_BLOCK);
        EmailPreferenceService.BounceVerdict hard = EmailPreferenceService.classifyBounce(EmailPreferenceService.BOUNCE_HARD);
        EmailPreferenceService.BounceVerdict soft = EmailPreferenceService.classifyBounce(EmailPreferenceService.BOUNCE_SOFT);
        Test.stopTest();

        Assert.isTrue(block.isConsentEvent, 'A block bounce is the mailbox refusing future mail.');
        Assert.isFalse(hard.isConsentEvent, 'A hard bounce means the address does not exist. That is not the person saying stop.');
        Assert.isFalse(soft.isConsentEvent, 'A soft bounce is temporary. Suppressing on it destroys the audience.');
    }

    @IsTest
    static void hardBounceSuppressesSendsButNotConsent() {
        Test.startTest();
        EmailPreferenceService.BounceVerdict hard = EmailPreferenceService.classifyBounce(EmailPreferenceService.BOUNCE_HARD);
        EmailPreferenceService.BounceVerdict soft = EmailPreferenceService.classifyBounce(EmailPreferenceService.BOUNCE_SOFT);
        Test.stopTest();

        Assert.isTrue(hard.suppressFromAllSends, 'An undeliverable address is removed from sends.');
        Assert.isFalse(soft.suppressFromAllSends, 'A soft bounce is retried.');
    }

    @IsTest
    static void doNotMarketFlagBlocksMarketingSend() {
        Contact_Master__c c = [SELECT Id FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1];
        c.DoNotMarket__c = true;

        Test.startTest();
        update c;
        Boolean canSend = EmailPreferenceService.mayReceiveMarketing(c.Id);
        Test.stopTest();

        Assert.isFalse(canSend, 'The profile-level flag is honoured even with an opt-in record present.');
    }

    @IsTest
    static void sendGuardReturnsFalseWithNoContact() {
        Test.startTest();
        Assert.isFalse(EmailPreferenceService.mayReceiveMarketing(null), 'No contact, no send.');
        Test.stopTest();
    }
}
