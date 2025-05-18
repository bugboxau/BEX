# AI Tutor Bot – Bugbox: Trimester 1 Development Summary

**Daniel Joseph Mattioli**  
s223377562

---

## Project Objective

The AI Tutor Bot project is aimed to help students with coding lessons, provide answers to conceptual queries, and provide direction through the lesson plans whilst being integrated into the Bugbox learning platform. Its main objective was to provide age-appropriate, clear, and instructive responses in order to replicate the assistance of a human tutor in a virtual environment.

The architecture of the bot was designed to be scalable, modular, and flexible enough to accommodate future additions like content filtering, user personalisation, and agentic AI autonomous behavior.

---

## Key Achievements and Milestones

### Front-End Development & UI Enhancements

Front-end development received a lot of attention during Trimester 1 to ensure the chatbot was both aesthetically consistent with the Bugbox brand and easy for young students to use. Ben and Daniel led the effort to redesign the user interface, including crucial components like:

- **Onboarding Modal**: The student is prompted to provide their name, age, and current lesson in a form that appears at the start of each session. This data helps customise the tutoring experience by adjusting the AI's language and focus.

- **Branding & Design Consistency**: Bugbox branding was reflected in the redesigned buttons, layout of the UI, and UI colours, which strengthened user familiarity and trust.

- **Markdown Rendering**: The AI Tutor's output now supports markdown, making it easier to understand, particularly when explaining code. This allows the bot to display formatted code blocks, bold highlights, and organised lists.

- **Debug and Offline Modes**: These modes allow developers to test the front-end without logging into the GPT API and provide real-time console feedback for troubleshooting.

These improvements laid the groundwork for a professional, student-focused interface ready for future classroom use.

---

### GPT-4o Integration & Smart Interactions

The chatbot was upgraded from GPT-3.5 to GPT-4o, enhancing intelligence and enabling more effective, contextually aware, and cohesive responses. Ben confirmed:

- Higher conversation quality and quicker reaction times than previous models.
- Cost-effective operation: GPT-4o use stayed within acceptable cost ranges even with high-volume testing.
- Better lesson relevance: The chatbot could adjust tone and depth based on user input (age, lesson).

Additional features:

- **Dynamic lesson focus**: The bot stays on topic if the user specifies a lesson.
- **Example-driven responses**: Markdown formatting made syntax breakdowns and explanations clearer.

---

### Quality Assurance (QA) and Testing

QA and testing for the bot’s week 8 and 9 versions were led by Amith. With a focus on usability, reliability, and content safety, the process included both automated scripts and manual review. Key findings:

- **Positive onboarding feedback**: Personalised inputs and a child-friendly design foster engagement.
- **Performance**: GPT-4o integration increased latency slightly (2–3s → 4–6s), considered acceptable given improved output.
- **Input/output issues**: HTML `<br><br>` tags caused minor visual bugs.
- **Concurrency issues**: Responses were sometimes out of order when automated inputs were sent too quickly. Increasing delay fixed most cases.
- **Child safety**: Off-topic and inappropriate queries were flagged and blocked.

Amith also confirmed the bot’s effectiveness in simplifying language for younger users and suggested UI layout improvements.

---

### Documentation and Scalability Planning

To future-proof the bot, planning and documentation were prioritised:

- **Project documentation** was started by Daniel to track contributions, tasks, and progress.
- **README.md** was updated by Ben for clearer onboarding and setup.
- **Scalability Report (in progress)** by Ben evaluated:
  - Hosting strategies
  - Front-end delivery pipelines
  - Backend architecture options
  - API cost estimates and optimisation

This supports the goal of integrating the AI Tutor into a production-ready learning platform.

---

### Agentic AI Exploration

Goransh researched **Agentic AI**—a next-gen AI that acts independently, plans tasks, and adapts behavior. Key findings:

- **Autonomy**: Ideal for student environments needing real-time assistance.
- **Self-learning**: The bot could learn user habits over time.
- **Goal-driven responses**: Could guide students through objectives and send reminders.
- **Scalability**: Can assist many users simultaneously without human oversight.

Agentic AI could enable adaptive tutoring in Bugbox, such as adjusting lesson difficulty, identifying misunderstanding, and recommending personalised practice problems.

---

## Trimester 1 Activity Timeline

| Date         | Team Member(s)   | Activity / Contribution                                                                 |
|--------------|------------------|------------------------------------------------------------------------------------------|
| 26 Mar 2025  | Dylan (advisor)  | Clarified AI Tutor scope, shared lesson files                                           |
| 2 Apr 2025   | Liam             | Created 2-phase plan and assigned tasks                                                 |
| 3 Apr 2025   | Daniel & Ben     | Began UI redesign to match Bugbox branding                                              |
| 3 Apr 2025   | Liam             | Initiated content filtering logic and inappropriate keyword detection                   |
| 10 Apr 2025  | Ben              | Tested GPT prompt responses, validated educational output                               |
| 15 Apr 2025  | Daniel & Zane    | Developed JSON-based testing framework for scoring AI responses                         |
| 15 Apr 2025  | Amith            | Built Selenium test suite for edge case detection                                       |
| 15 Apr 2025  | Liam             | Drafted and tested initial content filtering scripts                                    |
| 17 Apr 2025  | Daniel & Ben     | Uploaded updated UI to GitHub, coordinated repo syncing                                 |
| 17 Apr 2025  | Amith            | Supported Liam and documented content filtering scope                                   |
| 17 Apr 2025  | Liam             | QA on edge cases, confirmed proper blocking of inappropriate input                      |
| 17 Apr 2025  | Goransh          | Submitted Agentic AI research report                                                    |
| 1 May 2025   | Daniel           | Finalised UI overhaul                                                                   |
| 1 May 2025   | Ben              | Added onboarding, markdown, GPT-4o, and other features                                  |
| 1 May 2025   | Amith            | Started QA document for Week 8                                                          |
| 8 May 2025   | Daniel           | Began trimester-long documentation of progress                                          |
| 8 May 2025   | Amith            | Completed QA Report for Week 8–9                                                        |
| 8 May 2025   | Ben              | Started Scalability Report                                                              |
| Ongoing      | All Members      | Communicated via MS Teams, managed GitHub, delegated tasks, and shared progress         |

---

## Next Steps

- Finalise the scalability report to guide future deployment and cost modelling.
- Integrate Agentic AI principles to enable proactive learning and autonomous feedback.
- Expand content filtering with more edge-case scenarios and age-based responses.
- Pilot the chatbot in classroom settings to gather practical user feedback.

---
