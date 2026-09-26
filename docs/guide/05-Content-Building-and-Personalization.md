# 05 · Content Building & Personalization

> Phase 5 of 17 · 30% of the MCN paper lives here, split between content and orchestration

## Two syntaxes, one intent

| Platform | Native templating | Also works | Not available |
|---|---|---|---|
| Marketing Cloud Engagement | AMPscript, SSJS, merge fields, percent directives | Handlebars in Content Builder blocks | — |
| Marketing Cloud Next | **Handlebars** | AMPscript and SSJS for compatibility | Content Builder as a separate product |

Handlebars is the answer to "which personalization syntax is native to Marketing
Cloud Next". AMPscript, SSJS and merge fields are the MCE options, and they still
function in MCN for compatibility, but the MCN-native templating is Handlebars.

## Personalization that cannot break

The rule: **every field has a fallback, and the fallback has to be grammatical.**

```ampscript
%%[ SET @greeting = "" ]%%
%%[ IF NOT EMPTY(@firstName) THEN
      SET @greeting = CONCAT("Hi ", @firstName, ",")
   ELSE
      SET @greeting = "Hi there,"
   END IF ]%%
%%[ SET @store = "" ]%%
%%[ IF NOT EMPTY(@preferredStore) THEN
      SET @store = CONCAT(" Your ", @preferredStore, " store has new arrivals.")
   END IF ]%%
%%=v(@greeting)%%=v(@store)%%
```

The same three lines in Handlebars:

```handlebars
{{#if firstName}}Hi {{firstName}},{{else}}Hi there,{{/if}}
{{#if preferredStore}} Your {{preferredStore}} store has new arrivals.{{/if}}

<a href="{{unsubscribeUrl}}">Unsubscribe</a>
```

Three things in the AMPscript version that will not work if you paste it into
MCN content:

1. The `%%[ ... ]%%` / `%%= ... %%` percent-directive syntax is not the MCN
   template syntax — MCN content uses Handlebars block expressions.
2. `SET` and `IF` blocks do not exist in Handlebars. Blocks and inline helpers
   replace them.
3. The MCN data bindings come from the Data 360 unified profile, not from a
   Data Extension row, so the attribute names are the DMO field names — a
   contact with no profile row renders as empty, not as an error.

## Never let a broken tag reach a customer

| Failure | Symptom | Cause | Fix |
|---|---|---|---|
| Unresolved merge field | `%% Preferred_Store__c %%` visible in the email | Attribute not in the DE, or wrong case | Fallback on every field, validate with a test send |
| Blank hero block | Empty space where the image should be | Conditional not handled | Default image in the else branch |
| Repeater renders once | Only the first row | No `%%[ NEXT ]%%` in the loop, or the set is empty | Guard the empty case |
| Unsubscribe link missing | Deliverability and legal exposure | Link not built from the required merge field | Treat the unsubscribe merge field as non-optional |

Always test to a seed list across every segment, including the segment with the
most missing data. A welcome email that renders perfectly for 92% of contacts
still embarrasses you for 8%.

## Conditional and repeated content

| Requirement | MCE | MCN |
|---|---|---|
| Mobile vs desktop hero | AMPscript on `RequestMobileContent` | Content variation |
| Category banner | Conditional content block | Content variation |
| Up to 3 recommendations | Repeater (`%%[ FOR ]%%` / `%%[ NEXT ]%%`) | Repeater block |
| One of N layouts | Block-level personalisation | Content variation |
| Suppress a whole block | `SET @hideBlock` + `%%[ IF NOT @hideBlock ]%%` | `{{#if}}` wrapper |

Text-to-image ratio is a deliverability constraint, not a design preference. One
image stretched across desktop and mobile destroys the ratio in Gmail and Outlook
and costs you the inbox. Use two assets.

## Consent inside the content

```handlebars
{{#if consentMarketing}}
  <a href="{{unsubscribeUrl}}">Unsubscribe</a>
{{else}}
  <p>You are receiving this transactional message.</p>
{{/if}}
```

The unsubscribe mechanism is not a content decision: the preference centre link,
the list-unsubscribe header and the suppression write all have to agree. In this
repo `EmailPreferenceService` owns the preference state and
`AgentforceMarketingActionService` is the extension point for generated content,
with the human review step built in.

## CloudPages and landing pages

A CloudPage is a Marketing Cloud-hosted landing page: it can render content with
AMPscript, capture form entries, and it shares the subscriber context. Use one
when the page needs marketing data or consent capture on a marketing domain. Use
your own CMS when the page is brand-critical and the design team owns it — but
then implement the consent banner yourself, and the exam expects you to know
that a consent banner can be configured on **external pages** as well as on
marketing landing pages.

## Checklist

- [ ] Every personalized field has a fallback and the fallback reads naturally.
- [ ] Test sends go to a seed list from every segment, including the emptiest one.
- [ ] Mobile and desktop get separate assets, not one stretched image.
- [ ] The unsubscribe link is present, correct, and wired to a suppression write.
- [ ] Repeat blocks handle the empty case.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/AgentforceMarketingActionService.cls` | Generated-content review workflow with a human approval gate |
| `force-app/main/default/contentassets/` | Content Builder folder structure for the consent and template blocks |
| `force-app/main/default/email/` | Two email templates with compliant preference centre and unsubscribe handling |

## Exercises

- **ex-05-1 · Write the Defensive Personalisation Block** — AMPscript with a fallback on every field.
- **ex-05-2 · Rebuild It in Handlebars** — the MCN equivalent plus the three migration traps.
- **MP-05** in [14 · Practical Exercises](14-Practical-Exercises-and-Mini-Projects.md) builds both for real.
