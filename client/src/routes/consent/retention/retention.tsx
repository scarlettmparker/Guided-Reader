
import { marked } from 'marked';
import { Component, createSignal, onMount } from 'solid-js';
import styles from './retention.module.css'

const Retention: Component = () => {
  const [html_content, set_html_content] = createSignal("");
  const markdown = `
### Retention Schedule for User Annotations

#### 1. **Annotations Submitted by Users**

-   **Retention Period**: Annotations submitted by users will be retained indefinitely.
    
-   **Conditions for Deletion**:
    
    -   **User-Initiated Deletion**: Users can delete their annotations at any time through their account settings.
    -   **Account Deletion**: If a user chooses to delete their account, all associated annotations will be permanently removed from our system.
    -   **Ban or Suspension**: If a user is banned or suspended from the platform, their annotations may be retained for a period of [specify a time frame, e.g., 30 days] for review purposes. After this period, annotations will be permanently deleted unless otherwise required by law.

#### 2. **User Data and Account Information**

-   **Retention Period**: User account information, including annotations, will be retained as long as the account is active.
    
-   **Conditions for Deletion**:
    
    -   **User-Initiated Deletion**: Users can delete their accounts and all associated data, including annotations, at any time.
    -   **Inactivity**: Accounts that have been inactive for a period of [specify a time frame, e.g., 12 months] may be subject to deletion, along with all associated annotations, after prior notification.

#### 3. **Data Review and Compliance**

-   All retained data, including annotations, will be subject to periodic review to ensure compliance with this retention schedule and any applicable legal requirements.`

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

export default Retention;