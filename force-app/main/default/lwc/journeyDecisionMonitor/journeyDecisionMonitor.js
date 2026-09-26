import { LightningElement, wire } from 'lwc';
import getDecisions from '@salesforce/apex/JourneyEntryEventService.evaluate';

/**
 * journeyDecisionMonitor
 *
 * Shows recent journey entry decisions and, more usefully, why the blocked ones
 * were blocked.
 *
 * The blocked-decision count is the operational signal. A rise in blocked
 * entries means one of three things: a consent source stopped syncing, a
 * frequency cap is too tight, or a journey is targeting the wrong population.
 * None of those is visible from the send rate alone, which is the number teams
 * usually watch.
 */
export default class JourneyDecisionMonitor extends LightningElement {
    decisions = [];
    error;

    @wire(getDecisions, { journeyName: '$journeyFilter' })
    wiredDecisions(result) {
        const { data, error } = result;
        if (data) {
            this.error = undefined;
            this.decisions = (data.decisions || []).map((d) => ({
                ...d,
                decisionClass: d.decision === 'Allowed' ? 'slds-theme_success' : 'slds-theme_warning'
            }));
        } else if (error) {
            this.handleError(error);
        }
    }

    get journeyFilter() {
        return 'Onboarding';
    }

    get blockedCount() {
        return this.decisions.filter((d) => d.decision === 'Blocked').length;
    }

    get hasDecisions() {
        return this.decisions.length > 0;
    }

    handleError(error) {
        if (Array.isArray(error?.body)) {
            this.error = error.body.map((e) => e.message).join(', ');
        } else if (error?.body?.message) {
            this.error = error.body.message;
        } else {
            this.error = 'Journey decisions could not be loaded.';
        }
    }
}
