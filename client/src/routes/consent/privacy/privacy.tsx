import { marked } from "marked";
import { Component, createSignal, onMount } from "solid-js";
import styles from './privacy.module.css'

const Privacy: Component = () => {
  const [html_content, set_html_content] = createSignal("");
  const markdown = `
## Guided Reader privacy notice

This privacy notice tells you what to expect us to do with your information.

-   [Contact details](#contact-details)

-   [What information we collect, use, and why](#what-information-we-collect-use-and-why)

-   [Lawful bases and data protection rights](#lawful-bases-and-data-protection-rights)

-   [Where we get information from](#where-we-get-information-from)

-   [How long we keep information](#how-long-we-keep-information)

-   [Who we share information with](#who-we-share-information-with)

-   [How to complain](#how-to-complain)

## Contact details

### Email

hi@scarlettparker.co.uk

## What information we collect, use, and why

We collect or use the following information  **for archiving purposes**:

-   Website and app user journey information

We collect or use the following information  **to comply with legal requirements**:

-   Not applicable.

## Lawful bases and data protection rights

Under UK data protection law, we must have a “lawful basis” for collecting and using your information. There is a list of possible lawful bases in the UK GDPR. You can find out more about lawful bases on the ICO’s website.

Which lawful basis we rely on may affect your data protection rights which are in brief set out below. You can find out more about your data protection rights and the exemptions which may apply on the ICO’s website:

-   **Your right of access**  - You have the right to ask us for copies of your information. You can request other information such as details about where we get information from and who we share information with. There are some exemptions which means you may not receive all the information you ask for.  [You can read more about this right here](https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#roa "Your data protection rights").
-   **Your right to rectification** - You have the right to ask us to correct or delete information you think is inaccurate or incomplete.  [You can read more about this right here](https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rtr "Your data protection rights").
-   **Your right to erasure** - You have the right to ask us to delete your information.  [You can read more about this right here](https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rte "Your data protection rights").
-   **Your right to restriction of processing** - You have the right to ask us to limit how we can use your information.  [You can read more about this right here](https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rtrop "Your data protection rights").
-   **Your right to object to processing** - You have the right to object to the processing of your data.  [You can read more about this right here](https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rto "Your data protection rights").
-   **Your right to data portability** - You have the right to ask that we transfer the information you gave us to another organisation, or to you.  [You can read more about this right here](https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rtdp "Your data protection rights").
-   **Your right to withdraw consent** – When we use consent as our lawful basis you have the right to withdraw your consent at any time.  [You can read more about this right here](https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rtwc "Your data protection rights").

If you make a request, we must respond to you without undue delay and in any event within one month.

To make a data protection rights request, please contact us using the contact details at the top of this privacy notice.

### Our lawful bases for the collection and use of your data

Our lawful bases for collecting or using information **for archiving purposes**  are:

-   Consent - we have permission from you after we gave you all the relevant information. All of your data protection rights may apply, except the right to object. To be clear, you do have the right to withdraw your consent at any time.

Our lawful bases for collecting or using information **to comply with legal requirements**  are:

-   Consent - we have permission from you after we gave you all the relevant information. All of your data protection rights may apply, except the right to object. To be clear, you do have the right to withdraw your consent at any time.

## Where we get information from

-   Directly from you

## How long we keep information

For information on how long we keep information, see our retention schedule at https://reader.scarlettparker.co.uk/consent/retention

## Who we share information with

### Others we share information with

-   Publicly on our website, social media or other marketing and information media

## How to complain

If you have any concerns about our use of your data, you can make a complaint to us using the contact details at the top of this privacy notice.

If you remain unhappy with how we’ve used your data after raising a complaint with us, you can also complain to the ICO.

The ICO’s address:

Information Commissioner’s Office  
Wycliffe House  
Water Lane  
Wilmslow  
Cheshire  
SK9 5AF

Helpline number: 0303 123 1113

Website:  [https://www.ico.org.uk/make-a-complaint](https://ico.org.uk/make-a-complaint/ "Make a complaint")

## Last updated

17 January 2025`;

  onMount(async () => {
    const renderer = new marked.Renderer();

    // ... add target="_blank" to all links (opens in new tab) ...
    renderer.link = function ({ href, title, text }) {
        const target = '_blank';
        const rel = 'noopener noreferrer';
        return `<a href="${href}" title="${title || ''}" target="${target}" rel="${rel}">${text}</a>`;
    };

    marked.setOptions({
        breaks: true,
        renderer: renderer,
    });

    const html = await marked(markdown);
    set_html_content(html);
  });

  return (
    <div class={styles.markdown} innerHTML={html_content()}>
    </div>
  );
}

export default Privacy;