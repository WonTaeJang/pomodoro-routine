import type { LegalContent } from "./content";
import { LEGAL_OPERATOR as OP } from "./operator";

/**
 * Privacy policy and terms (English). Same shape as content.ko.ts.
 * Trimmed to the items Korean law requires (PIPA Art. 30, Enforcement Decree Art. 31) plus Google’s Limited Use statement.
 */

const contact = `Contact: ${OP.email} (privacy officer: ${OP.name}, the operator)`;
const under14 =
  "If you’re under 14, you can’t use the login feature (every feature still works without logging in). We don’t check ages, but if we find that an account belongs to someone under 14, we’ll delete the account and its saved information.";

const content: LegalContent = {
  tocLabel: "Contents",
  effective: (date) => `Effective ${date}`,
  docs: {
    privacy: {
      title: "Privacy Policy",
      intro:
        "Kkamodoro is a free, non-commercial service run by a single developer. There are no ads, paid features or analytics tools, and every feature works without logging in. When you log in, we process the information needed to sync across devices.",
      sections: [
        {
          id: "collect",
          title: "1. Information we process",
          blocks: [
            "If you don’t log in, your tasks, history and settings stay in your browser and are never sent to Kkamodoro’s servers.",
            {
              text: "When you log in, we process the following.",
              items: [
                "Google login: name, email address, profile photo URL and Google account ID",
                "Kakao login: nickname, profile photo URL, Kakao account ID, and email address (only if you agree to share it)",
                "A nickname you set yourself (optional)",
                "Tasks: title, estimated and completed pomodoros, done status, order, and when each was created, completed, cleared or deleted",
                "Focus history: session type, end time, duration, the task title selected at the time, and whether it completed a cycle",
                "Settings: focus and break lengths, long break interval, auto start, chosen focus sound, whether tasks show on certificates, and the currently selected task",
                "Information created automatically: sign-up and last login time, and access logs (such as IP address)",
              ],
            },
            "We never ask for a password. We don’t use cookies; your login session and settings are kept in your browser’s storage (localStorage) and are removed when you clear the site’s data.",
          ],
        },
        {
          id: "purpose",
          title: "2. Why we process it",
          blocks: [
            {
              text: "We use this information only to:",
              items: [
                "Log you in and tell accounts apart",
                "Save your tasks, history and settings to your account and keep them in sync across devices",
                "Show your nickname, photo, email and login method on your profile",
                "Answer your questions and investigate errors",
              ],
            },
            "We never use it for advertising or marketing, never sell it, and don’t share it with other companies or people except when required by law (for the providers we entrust processing to, see section 4).",
            "Kkamodoro’s use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
          ],
        },
        {
          id: "retention",
          title: "3. Retention and deletion",
          blocks: [
            "Information saved to your account is kept until you delete your account. When you delete your account or the Service shuts down, your account, tasks, history and settings are deleted from the database right away and can’t be recovered.",
            "Access logs and backups in the providers’ systems are deleted after the periods the providers below set.",
          ],
        },
        {
          id: "processors",
          title: "4. Processors and international transfers",
          blocks: [
            "Instead of running its own servers, the operator entrusts processing to the following providers.",
            {
              text: "Supabase Inc. (login and data storage)",
              items: [
                "Server location: Seoul, Republic of Korea",
                "Information: login information, tasks, history, settings and access logs listed in section 1",
                "Retention: until you delete your account (access logs and backups follow the provider’s policy)",
              ],
            },
            {
              text: "Vercel Inc. (website hosting, transferred outside Korea)",
              items: [
                "Recipient: Vercel Inc. (privacy@vercel.com)",
                "Country: the United States and other regions where Vercel operates",
                "When and how: sent over the internet each time you visit the site",
                "Information: access logs such as IP address, browser details and requested URLs",
                "Purpose: delivering the website (hosting)",
                "Retention: according to the provider’s policy",
              ],
            },
            "This transfer to Vercel is entrusted processing needed to provide the Service, disclosed in this policy under Article 28-8(1)(3)(a) of the Korean Personal Information Protection Act. It happens whenever you visit the site, even without logging in. If you don’t want it, don’t use the site (you won’t be able to use the Service).",
            "Information Google and Kakao process during login is covered by their own privacy policies.",
          ],
        },
        {
          id: "rights",
          title: "5. Your rights",
          blocks: [
            {
              text: "You can do the following with your information at any time.",
              items: [
                "View it on your profile and throughout the app",
                "Correct it by changing your nickname on your profile",
                "Delete it or stop its processing by deleting your account on your profile",
                "Make any other request by emailing the address below",
              ],
            },
            "Disconnecting Kkamodoro in your Google or Kakao account settings doesn’t delete your Kkamodoro account, so delete your account if you also want your records removed.",
          ],
        },
        {
          id: "children",
          title: "6. Children under 14",
          blocks: [under14],
        },
        {
          id: "security",
          title: "7. How we protect your information",
          blocks: [
            "All traffic is encrypted with HTTPS.",
            "The database only lets you read and write your own information while logged in.",
            "Only the operator has admin access to the database, and looks at user information only when needed, such as to investigate an error or handle your request.",
            "We don’t handle passwords; we only use Google and Kakao login.",
          ],
        },
        {
          id: "contact",
          title: "8. Privacy officer and contact",
          blocks: [
            contact,
            "In Korea, you can also contact the Personal Information Infringement Report Center (privacy.kisa.or.kr, 118) or the Personal Information Dispute Mediation Committee (www.kopico.go.kr, 1833-6972).",
          ],
        },
        {
          id: "changes",
          title: "9. Changes to this policy",
          blocks: [
            "If this policy changes, we’ll post the changes and their effective date on this page.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      intro: `Kkamodoro (the "Service") is a free, non-commercial pomodoro timer run personally by ${OP.name} (the "Operator"). These terms set out the conditions for using it.`,
      sections: [
        {
          id: "service",
          title: "1. The Service",
          blocks: [
            "The Service offers a pomodoro timer, task list, focus history and stats, certificates, focus sounds and Kkami care for free. There are no ads or paid features.",
            "Every feature works without logging in. Logging in saves your tasks, history and settings to your account so you can continue on other devices.",
          ],
        },
        {
          id: "account",
          title: "2. Accounts",
          blocks: [
            "You log in with a Google or Kakao account. By logging in, you agree to these terms.",
            under14,
            "Keep your Google or Kakao account secure, and don’t log in with someone else’s account.",
            "You can delete your account at any time on your profile. Deleting it removes everything saved to the account and can’t be undone.",
          ],
        },
        {
          id: "prohibited",
          title: "3. Prohibited conduct",
          blocks: [
            {
              text: "Please don’t:",
              items: [
                "Access the Service or its servers abnormally, or try to access other users’ information",
                "Disrupt the Service, for example by sending excessive automated requests",
                "Enter anything that infringes others’ rights or breaks the law",
                "Use the Service for unlawful purposes",
              ],
            },
            "If such conduct is found, the Operator may restrict or delete the account involved.",
          ],
        },
        {
          id: "changes-service",
          title: "4. Changes and shutdown",
          blocks: [
            "Because this is a personal project, the Operator may add or change features, or shut down all or part of the Service. If the Service shuts down, information saved to accounts is deleted.",
            "The Service may pause for maintenance, outages or problems with outside services (Google, Kakao, Supabase, Vercel). Since one person runs it, recovery and replies may take time.",
          ],
        },
        {
          id: "disclaimer",
          title: "5. Limitation of liability",
          blocks: [
            "The Service is provided free of charge and as is. The Operator doesn’t guarantee that it will run without interruption or that your records will always be preserved.",
            "Without logging in, your records live only in your browser and may be lost if you clear browser data or switch devices.",
            "Notifications and sounds may be delayed or not play depending on your browser and device settings.",
            "Except in cases of intent or gross negligence, the Operator isn’t liable for damages arising from use of the Service, to the extent permitted by law.",
          ],
        },
        {
          id: "ip",
          title: "6. Intellectual property",
          blocks: [
            "The Service’s source code is available under the MIT License.",
            "Kkami’s photos and illustrations and the focus sound recordings are not covered by the MIT License and may not be used outside the Service without permission from the Operator or the original creators. You may save and share certificate images you create for personal use.",
          ],
        },
        {
          id: "contact",
          title: "7. Contact",
          blocks: [contact],
        },
      ],
    },
  },
};

export default content;
