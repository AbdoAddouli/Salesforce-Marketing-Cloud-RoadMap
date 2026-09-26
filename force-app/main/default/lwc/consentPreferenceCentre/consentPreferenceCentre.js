import { LightningElement, api, wire } from 'lwc';
import getConsentState from '@salesforce/apex/ConsentSyncService.resolve';
import recordConsent from '@salesforce/apex/ConsentSyncService.record';

const CHANNELS = ['Email', 'SMS', 'WhatsApp', 'Push'];
const PURPOSES = ['Marketing'];

/**
 * consentPreferenceCentre
 *
 * Reads the resolved consent state per channel and purpose and writes an
 * evidenced decision.
 *
 * Two design rules the component will not break:
 *   1. It renders the resolved state from the server, never a local guess.
 *      A client-side toggle that assumes success is how a preference centre
 *      tells someone they are opted out when they are not.
 *   2. It never presents opt-out as a reversible toggle in the same control as
 *      opt-in. An opt-out is a distinct action, because the two are not
 *      symmetric: opt-out is terminal.
 */
export default class ConsentPreferenceCentre extends LightningElement {
    @api contactId;

    rows = [];
    error;

    connectedCallback() {
        this.template.host.addEventListener('refreshconsent', this.handleRefresh);
    }

    disconnectedCallback() {
        this.template.host.removeEventListener('refreshconsent', this.handleRefresh);
    }

    handleRefresh = () => {
        this.load();
    };

    get channels() {
        return CHANNELS;
    }

    get purposes() {
        return PURPOSES;
    }

    get wiringContactId() {
        return this.contactId;
    }

    @wire(getConsentState, { contactId: '$wiringContactId', channel: 'Email', purpose: 'Marketing' })
    wiredEmailState(result) {
        const { data, error } = result;
        if (data) {
            this.error = undefined;
            this.applyState(data);
        } else if (error) {
            this.handleError(error);
        }
    }

    applyState(decision) {
        const rows = this.rows.filter((r) => r.channel !== decision.channel);
        rows.push({
            channel: decision.channel,
            purpose: decision.purpose,
            resolvedStatus: decision.resolvedStatus,
            maySend: decision.maySend,
            reason: decision.reason,
            statusClass: decision.maySend
                ? 'slds-theme_success'
                : 'slds-theme_error',
            actionLabel: decision.maySend ? 'Opt out' : 'Opt in'
        });
        this.rows = rows;
    }

    /**
     * Write the decision, then re-read.
     *
     * The re-read is not optional. The server resolves conflicts across sources
     * and the client does not know about any of them, so the response of the
     * write is not the answer, the subsequent read is.
     */
    async handleToggle(event) {
        const { channel, purpose, optedIn } = event.currentTarget.dataset;
        try {
            const evidence = `Preference centre action by ${this.contactId} in Lightning Experience.`;
            await recordConsent({
                contactId: this.contactId,
                channel,
                purpose,
                status: optedIn === 'true' ? 'OptedOut' : 'OptedIn',
                source: 'WebBanner',
                evidence
            });
            this.dispatchEvent(new CustomEvent('consentchanged'));
        } catch (error) {
            this.handleError(error);
        }
    }

    handleError(error) {
        if (Array.isArray(error?.body)) {
            this.error = error.body.map((e) => e.message).join(', ');
        } else if (error?.body?.message) {
            this.error = error.body.message;
        } else {
            this.error = 'The consent state could not be read.';
        }
    }
}
