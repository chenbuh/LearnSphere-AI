# AI Governance Deepening: A/B Testing & Automated Feedback Loop

## Overview
This document outlines the enhanced A/B testing framework and the automated feedback analysis system implemented to improve AI generation quality and governance.

## 1. A/B Testing Framework

### Purpose
To scientifically evaluate different prompt strategies or model configurations by splitting traffic between a control group (Variant A - Default) and an experimental group (Variant B).

### Components
- **AIExperiment Entity**: Stores experiment configuration (Action Type, Variant Name, System Prompt B, Traffic Ratio).
- **Traffic Allocation**: `IAIExperimentService` randomly allocates traffic based on the defined ratio.
- **Variant Tracking**: `AIGenerationLog` now records `experiment_id` and `variant` (CONTROL or VARIANT_B) for every generation.
- **Reporting**: Automated reports comparing Success Rate, Rating (Positive/Negative), and Average Latency between variants.

### Workflow
1.  **Create Experiment**: Admin defines a new experiment for a specific `action_type` (e.g., `GENERATE_READING`) with a modified System Prompt (Variant B).
2.  **Start Experiment**: The system activates the experiment and begins allocating traffic.
3.  **Traffic Routing**:
    -   User requests generation.
    -   System checks for active experiment.
    -   Random roll (0-100) vs Traffic Ratio determines variant.
    -   System Prompt is selected based on variant.
4.  **Logging**: The execution log captures which variant was used.
5.  **Analysis**: Admin views the report to decide whether to promote Variant B to be the new Default.

### Database Schema (`ai_experiment`)
-   `id`: Primary Key
-   `action_type`: The target functional module.
-   `variant_name`: Name of the experimental variant.
-   `system_prompt_b`: The experimental prompt.
-   `traffic_ratio`: Percentage of traffic to route to Variant B.
-   `status`: RUNNING / STOPPED.

## 2. Automated Feedback Analysis (Feedback Loop)

### Purpose
To automatically diagnose the root cause of negative user feedback and propose improvements without manual intervention.

### Components
-   **Negative Feedback Trigger**: When a user rates a response as "Useless" (-1).
-   **Smart Attribution (AI Analysis)**: The system (via `analyzeNegativeFeedback`) sends the interaction context (System Prompt, User Input, AI Response, Feedback) to a "QA Expert" AI model.
-   **Analysis Output**: The AI generates an analysis of *why* the user was dissatisfied (e.g., "Instruction ignored", "Hallucination", "Format error").
-   **Storage**: The analysis is stored in `ai_content_feedback.analysis_result`.

### Workflow
1.  **User Feedback**: User clicks "Dislike" on generated content.
2.  **Admin Review**: In the "Feedback Loop" dashboard, the admin sees the negative feedback.
3.  **Trigger Analysis**: Admin clicks "Smart Attribution" (🤖 智能归因).
4.  **AI Diagnosis**: The system analyzes the specific failure case.
5.  **Result Display**: The diagnosis is displayed, helping the admin understand if the Prompt needs tuning or if the Model is inadequate.

### Database Changes
-   `ai_content_feedback`: Added `analysis_result` column (TEXT).
-   `ai_generation_log`: Added `experiment_id` and `variant` columns.

## 3. Frontend Integration (AI Governance Dashboard)

### New Features
-   **A/B Experiments Tab**:
    -   List active/stopped experiments.
    -   Create new experiment modal.
    -   View Experiment Report (charts/tables comparing A/B metrics).
-   **Feedback Loop Tab Enhancements**:
    -   "Recent User Feedback Stream" card.
    -   "Smart Attribution" button for negative feedback.
    -   Display of AI-generated analysis results.

## 4. API Endpoints

### Experiment Management
-   `POST /admin/ai/experiments`: Create/Start experiment.
-   `GET /admin/ai/experiments`: List experiments.
-   `POST /admin/ai/experiments/{id}/stop`: Stop experiment.
-   `GET /admin/ai/experiments/{id}/report`: Get comparison stats.

### Feedback Analysis
-   `GET /admin/ai/feedback/list`: Get paginated feedback list.
-   `POST /admin/ai/feedback/{id}/analyze`: Trigger AI analysis for a feedback item.
