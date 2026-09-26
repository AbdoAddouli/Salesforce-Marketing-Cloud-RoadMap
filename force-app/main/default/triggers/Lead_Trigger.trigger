trigger Lead_Trigger on Lead (before insert, before update) {
    MarketingCloudTriggerHandler.onLead(Trigger.new);
}