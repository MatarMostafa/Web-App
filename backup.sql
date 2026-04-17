--
-- PostgreSQL database dump
--

\restrict b2WGIZHkenOo2EhoNTO3tTjDYsYnN0VxSRRzg2OwyI5d8fMgqWwCA4jjTfSbplx

-- Dumped from database version 17.8 (a48d9ca)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neondb_owner;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AbsenceType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AbsenceType" AS ENUM (
    'SICK_LEAVE',
    'VACATION',
    'PERSONAL_LEAVE',
    'MATERNITY_LEAVE',
    'PATERNITY_LEAVE',
    'UNPAID_LEAVE',
    'BEREAVEMENT_LEAVE',
    'OTHER'
);


ALTER TYPE public."AbsenceType" OWNER TO neondb_owner;

--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ActivityType" AS ENUM (
    'CONTAINER_UNLOADING',
    'WRAPPING',
    'REPACKING',
    'CROSSING',
    'LABELING',
    'OTHER',
    'CONTAINER_LOADING'
);


ALTER TYPE public."ActivityType" OWNER TO neondb_owner;

--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'ASSIGNED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
    'OVERDUE',
    'PAUSED'
);


ALTER TYPE public."AssignmentStatus" OWNER TO neondb_owner;

--
-- Name: AssignmentTier; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AssignmentTier" AS ENUM (
    'PRIMARY',
    'BACKUP',
    'FALLBACK'
);


ALTER TYPE public."AssignmentTier" OWNER TO neondb_owner;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DocumentType" AS ENUM (
    'RESUME',
    'ID_CARD',
    'PASSPORT',
    'CONTRACT',
    'CERTIFICATE',
    'WORK_EVIDENCE',
    'PROFILE_PICTURE',
    'OTHER'
);


ALTER TYPE public."DocumentType" OWNER TO neondb_owner;

--
-- Name: NoteCategory; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NoteCategory" AS ENUM (
    'COMPLETION_REQUEST',
    'ADMIN_RESPONSE',
    'GENERAL_UPDATE',
    'ISSUE_REPORT'
);


ALTER TYPE public."NoteCategory" OWNER TO neondb_owner;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'DRAFT',
    'OPEN',
    'ACTIVE',
    'IN_PROGRESS',
    'IN_REVIEW',
    'COMPLETED',
    'CANCELLED',
    'EXPIRED',
    'PAUSED'
);


ALTER TYPE public."OrderStatus" OWNER TO neondb_owner;

--
-- Name: RatingStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."RatingStatus" AS ENUM (
    'EXCELLENT',
    'GOOD',
    'NEEDS_IMPROVEMENT'
);


ALTER TYPE public."RatingStatus" OWNER TO neondb_owner;

--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public."RequestStatus" OWNER TO neondb_owner;

--
-- Name: SettingsChangeType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."SettingsChangeType" AS ENUM (
    'FIRST_NAME',
    'LAST_NAME',
    'EMAIL_ADDRESS',
    'COMPANY_NAME',
    'TAX_NUMBER'
);


ALTER TYPE public."SettingsChangeType" OWNER TO neondb_owner;

--
-- Name: TrafficLight; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TrafficLight" AS ENUM (
    'RED',
    'YELLOW',
    'GREEN'
);


ALTER TYPE public."TrafficLight" OWNER TO neondb_owner;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'TEAM_LEADER',
    'EMPLOYEE',
    'HR_MANAGER',
    'SUPER_ADMIN',
    'CUSTOMER',
    'CUSTOMER_SUB_USER'
);


ALTER TYPE public."UserRole" OWNER TO neondb_owner;

--
-- Name: WorkScheduleType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."WorkScheduleType" AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'TEMPORARY',
    'INTERN'
);


ALTER TYPE public."WorkScheduleType" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users_sync; Type: TABLE; Schema: neon_auth; Owner: neondb_owner
--

CREATE TABLE neon_auth.users_sync (
    raw_json jsonb NOT NULL,
    id text GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED NOT NULL,
    name text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
    email text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
    created_at timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE neon_auth.users_sync OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Name: absences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.absences (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    type public."AbsenceType" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    reason text,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "documentUrls" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.absences OWNER TO neondb_owner;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.assignments (
    id text NOT NULL,
    "orderId" text,
    "employeeId" text NOT NULL,
    "assignedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    status public."AssignmentStatus" DEFAULT 'ASSIGNED'::public."AssignmentStatus" NOT NULL,
    tier public."AssignmentTier" DEFAULT 'PRIMARY'::public."AssignmentTier" NOT NULL,
    "estimatedHours" numeric(5,2),
    "actualHours" numeric(5,2),
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "customerActivityId" text,
    "pausedById" text,
    "processedQuantity" integer,
    "startedById" text,
    "stoppedById" text
);


ALTER TABLE public.assignments OWNER TO neondb_owner;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "tableName" text NOT NULL,
    "recordId" text NOT NULL,
    action text NOT NULL,
    "oldData" jsonb,
    "newData" jsonb,
    changes jsonb,
    "userId" text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ipAddress" text,
    "userAgent" text
);


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- Name: container_articles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.container_articles (
    id text NOT NULL,
    "containerId" text NOT NULL,
    "articleName" text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.container_articles OWNER TO neondb_owner;

--
-- Name: container_employees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.container_employees (
    id text NOT NULL,
    "containerId" text NOT NULL,
    "employeeId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    "completedAt" timestamp(3) without time zone,
    "isCompleted" boolean DEFAULT false NOT NULL,
    notes text,
    "reportedArticleQuantity" integer DEFAULT 0,
    "reportedCartonQuantity" integer DEFAULT 0
);


ALTER TABLE public.container_employees OWNER TO neondb_owner;

--
-- Name: containers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.containers (
    id text NOT NULL,
    "serialNumber" text NOT NULL,
    "orderId" text NOT NULL,
    "cartonQuantity" integer NOT NULL,
    "articleQuantity" integer NOT NULL,
    "cartonPrice" numeric(10,2) NOT NULL,
    "articlePrice" numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.containers OWNER TO neondb_owner;

--
-- Name: customer_activities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_activities (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "orderId" text,
    name text NOT NULL,
    type public."ActivityType" NOT NULL,
    code text,
    description text,
    unit text DEFAULT 'hour'::text NOT NULL,
    quantity integer,
    "unitPrice" numeric(10,2),
    "lineTotal" numeric(12,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "basePrice" numeric(10,2) DEFAULT 0,
    "articleBasePrice" numeric(10,2) DEFAULT 0
);


ALTER TABLE public.customer_activities OWNER TO neondb_owner;

--
-- Name: customer_description_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_description_templates (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "templateLines" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


ALTER TABLE public.customer_description_templates OWNER TO neondb_owner;

--
-- Name: customer_prices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_prices (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "customerActivityId" text NOT NULL,
    "minQuantity" integer NOT NULL,
    "maxQuantity" integer NOT NULL,
    price numeric(10,2) NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    "effectiveFrom" timestamp(3) without time zone NOT NULL,
    "effectiveTo" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customer_prices OWNER TO neondb_owner;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    id text NOT NULL,
    "companyName" text NOT NULL,
    "contactEmail" text,
    "contactPhone" text,
    address jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    industry text,
    "taxNumber" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.departments (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    code text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO neondb_owner;

--
-- Name: employee_performance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employee_performance (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    score numeric(5,2) NOT NULL,
    "trafficLight" public."TrafficLight" NOT NULL,
    "trafficLightReason" text,
    metrics jsonb,
    "manualOverride" boolean DEFAULT false NOT NULL,
    "manualOverrideById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.employee_performance OWNER TO neondb_owner;

--
-- Name: employee_qualifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employee_qualifications (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "qualificationId" text NOT NULL,
    "acquiredDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiryDate" timestamp(3) without time zone,
    "certificateUrl" text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "proficiencyLevel" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.employee_qualifications OWNER TO neondb_owner;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employees (
    id text NOT NULL,
    "employeeCode" text NOT NULL,
    "firstName" text,
    "lastName" text,
    "phoneNumber" text,
    "dateOfBirth" timestamp(3) without time zone,
    address text,
    "emergencyContact" jsonb,
    "hireDate" timestamp(3) without time zone NOT NULL,
    "terminationDate" timestamp(3) without time zone,
    "departmentId" text,
    "positionId" text,
    "managerId" text,
    "scheduleType" public."WorkScheduleType" DEFAULT 'FULL_TIME'::public."WorkScheduleType" NOT NULL,
    "hourlyRate" numeric(10,2),
    salary numeric(12,2),
    "isAvailable" boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    "blockedAt" timestamp(3) without time zone,
    "blockedReason" text,
    "performanceScore" numeric(5,2),
    "trafficLight" public."TrafficLight",
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public.employees OWNER TO neondb_owner;

--
-- Name: files; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.files (
    id text NOT NULL,
    filename text NOT NULL,
    "originalName" text NOT NULL,
    "mimeType" text NOT NULL,
    size integer NOT NULL,
    path text NOT NULL,
    "documentType" public."DocumentType" DEFAULT 'OTHER'::public."DocumentType" NOT NULL,
    description text,
    "expiryDate" timestamp(3) without time zone,
    "employeeId" text,
    "orderId" text,
    "assignmentId" text,
    "uploadedBy" text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.files OWNER TO neondb_owner;

--
-- Name: notification_outbox; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_outbox (
    id text NOT NULL,
    "notificationId" text,
    payload jsonb NOT NULL,
    channel text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "maxAttempts" integer DEFAULT 5 NOT NULL,
    "lockedUntil" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_outbox OWNER TO neondb_owner;

--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_preferences (
    id text NOT NULL,
    "userId" text NOT NULL,
    channels text[] DEFAULT ARRAY['in_app'::text, 'email'::text],
    "quietHoursStart" integer,
    "quietHoursEnd" integer,
    "digestEnabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_preferences OWNER TO neondb_owner;

--
-- Name: notification_recipients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_recipients (
    id text NOT NULL,
    "notificationId" text NOT NULL,
    "userId" text,
    channels text[],
    "readAt" timestamp(3) without time zone,
    "seenAt" timestamp(3) without time zone,
    "isArchived" boolean DEFAULT false NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    error text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification_recipients OWNER TO neondb_owner;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    "defaultChannels" text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "templateKey" text,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb,
    category text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveredAt" timestamp(3) without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: order_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_assignments (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "employeeId" text NOT NULL,
    role text,
    "hourlyRate" numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.order_assignments OWNER TO neondb_owner;

--
-- Name: order_description_data; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_description_data (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "descriptionData" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.order_description_data OWNER TO neondb_owner;

--
-- Name: order_notes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_notes (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "authorId" text NOT NULL,
    content text NOT NULL,
    "triggersStatus" public."OrderStatus",
    category public."NoteCategory" DEFAULT 'GENERAL_UPDATE'::public."NoteCategory" NOT NULL,
    "isInternal" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.order_notes OWNER TO neondb_owner;

--
-- Name: order_qualifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_qualifications (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "qualificationId" text NOT NULL,
    "customerActivityId" text,
    required boolean DEFAULT true NOT NULL,
    "minProficiency" integer DEFAULT 1 NOT NULL,
    unit text,
    "unitPrice" numeric(10,2),
    quantity integer NOT NULL,
    "lineTotal" numeric(12,2)
);


ALTER TABLE public.order_qualifications OWNER TO neondb_owner;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    title text,
    description text,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    duration integer,
    location text,
    "requiredEmployees" integer DEFAULT 1 NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    "specialInstructions" text,
    status public."OrderStatus" DEFAULT 'DRAFT'::public."OrderStatus" NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "estimatedHours" numeric(5,2),
    "actualHours" numeric(5,2),
    "usesTemplate" boolean DEFAULT false NOT NULL,
    "cartonQuantity" integer,
    "articleQuantity" integer,
    "customerId" text NOT NULL,
    "createdBySubAccountId" text,
    "teamId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public.orders OWNER TO neondb_owner;

--
-- Name: performance_thresholds; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.performance_thresholds (
    id text NOT NULL,
    "departmentId" text NOT NULL,
    "redMin" integer NOT NULL,
    "redMax" integer NOT NULL,
    "yellowMin" integer NOT NULL,
    "yellowMax" integer NOT NULL,
    "greenMin" integer NOT NULL,
    "greenMax" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.performance_thresholds OWNER TO neondb_owner;

--
-- Name: positions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.positions (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    level integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "departmentId" text NOT NULL,
    "minSalary" numeric(12,2),
    "maxSalary" numeric(12,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.positions OWNER TO neondb_owner;

--
-- Name: qualifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.qualifications (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    "isActive" boolean DEFAULT true NOT NULL,
    "requiresCertificate" boolean DEFAULT false NOT NULL,
    "expiryMonths" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.qualifications OWNER TO neondb_owner;

--
-- Name: ratings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ratings (
    id text NOT NULL,
    "orderId" text,
    "employeeId" text,
    "customerId" text,
    rating integer NOT NULL,
    comment text,
    category text,
    status public."RatingStatus" NOT NULL,
    "ratedBy" text,
    "ratingDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ratings OWNER TO neondb_owner;

--
-- Name: settings_change_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settings_change_requests (
    id text NOT NULL,
    "userId" text NOT NULL,
    "requestType" public."SettingsChangeType" NOT NULL,
    "currentValue" text,
    "requestedValue" text NOT NULL,
    reason text,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "reviewNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings_change_requests OWNER TO neondb_owner;

--
-- Name: sub_accounts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sub_accounts (
    id text NOT NULL,
    name text NOT NULL,
    code text,
    "isActive" boolean DEFAULT true NOT NULL,
    "customerId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public.sub_accounts OWNER TO neondb_owner;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_config (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_config OWNER TO neondb_owner;

--
-- Name: team_members; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_members (
    id text NOT NULL,
    "teamId" text NOT NULL,
    "employeeId" text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "leftAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.team_members OWNER TO neondb_owner;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teams (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "teamLeaderId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teams OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text,
    username text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'EMPLOYEE'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "refreshToken" text,
    "emailVerificationToken" text,
    "emailVerificationExpires" timestamp(3) without time zone,
    "passwordResetToken" text,
    "passwordResetExpires" timestamp(3) without time zone,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "twoFactorSecret" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: work_statistics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.work_statistics (
    id text NOT NULL,
    date date NOT NULL,
    "employeeId" text NOT NULL,
    "hoursWorked" numeric(5,2) NOT NULL,
    "overtimeHours" numeric(5,2) DEFAULT 0 NOT NULL,
    location text,
    projects text[],
    efficiency numeric(3,2),
    "qualityScore" numeric(3,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.work_statistics OWNER TO neondb_owner;

--
-- Data for Name: users_sync; Type: TABLE DATA; Schema: neon_auth; Owner: neondb_owner
--

COPY neon_auth.users_sync (raw_json, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
60ff652d-2854-4c7e-9478-df729f57a35e	2cecc32e8a110e73ad189be42decb606841adb491f746f7224f2e3ae864f211d	2026-01-07 11:45:55.189423+00	20260107114531_init	\N	\N	2026-01-07 11:45:53.663973+00	1
6e12ca6c-e457-4aaa-8a19-a8682cb429f9	745d0fa7a3f172748eebf43d8dc99c532c18d234039b1aa695a35c66cdaca68b	2026-01-27 14:11:57.111949+00	20250109_remove_activity_model	\N	\N	2026-01-27 14:11:56.267203+00	1
7eac4c22-cef0-455c-8870-3af99078cb34	998dbf2520cffad885a740641ce523b346689df3e19d46b9c2c2342bee0fdfe2	2026-01-27 14:12:08.3483+00	20260127141206_add_container_management	\N	\N	2026-01-27 14:12:07.416389+00	1
b9cd42a3-4d0c-4475-975f-6312d6998153	ee4c6829fd45e3a5601ecd206f162c252279ff12902d7de91aff916d2ed1948a	2026-01-28 07:53:04.652898+00	20260128075302_add_container_employee_reporting	\N	\N	2026-01-28 07:53:03.831118+00	1
96a25eca-8899-431f-8fd1-fae1e836e044	051e87ee0f3d3110f07d60e9853dd2eafff8c70a097fcc5e70d4903a1ec82475	2026-01-31 14:11:18.403736+00	20260130181205_add_article_base_price	\N	\N	2026-01-31 14:11:17.601402+00	1
cd0090e5-7600-4ddf-bc35-afd121ace670	b8f534ae7e366a7467cccb6a704157f7ab5fafa4c7e0bee459d8027bb808eb7e	2026-04-02 11:31:30.885537+00	20260325112728_feature_pricing_activities		\N	2026-04-02 11:31:30.885537+00	0
\.


--
-- Data for Name: absences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.absences (id, "employeeId", type, "startDate", "endDate", reason, status, "approvedBy", "approvedAt", "rejectedBy", "rejectedAt", "rejectionReason", "documentUrls", "createdAt", "updatedAt") FROM stdin;
cmk3ydpyn0024vnx8vs35bw50	cmk3ydfta000qvnx8erconpzd	PERSONAL_LEAVE	2024-04-01 00:00:00	2024-04-02 00:00:00	Personal matters	PENDING	\N	\N	\N	\N	\N	\N	2026-01-07 11:46:42.479	2026-01-07 11:46:42.479
cmk3ydpyn0022vnx8ozrrdo1y	cmk3ydewx000evnx8xrox75n2	SICK_LEAVE	2024-01-10 00:00:00	2024-01-12 00:00:00	Flu symptoms	APPROVED	cmk3ydewz000gvnx82cy8zbhf	2026-01-07 11:46:42.477	\N	\N	\N	\N	2026-01-07 11:46:42.479	2026-01-07 11:46:42.479
cmk3ydpyn0023vnx8nyut0ra6	cmk3ydfta000qvnx8erconpzd	VACATION	2024-03-15 00:00:00	2024-03-20 00:00:00	Family vacation	APPROVED	cmk3ydewz000gvnx82cy8zbhf	2026-01-07 11:46:42.477	\N	\N	\N	\N	2026-01-07 11:46:42.479	2026-01-07 11:46:42.479
cmk3yeipj0024vniwz08slto1	cmk3ydewx000evnx8xrox75n2	SICK_LEAVE	2024-01-10 00:00:00	2024-01-12 00:00:00	Flu symptoms	APPROVED	cmk3ydewz000gvnx82cy8zbhf	2026-01-07 11:47:19.734	\N	\N	\N	\N	2026-01-07 11:47:19.735	2026-01-07 11:47:19.735
cmk3yeipj0022vniweviosc8p	cmk3ydfta000qvnx8erconpzd	PERSONAL_LEAVE	2024-04-01 00:00:00	2024-04-02 00:00:00	Personal matters	PENDING	\N	\N	\N	\N	\N	\N	2026-01-07 11:47:19.735	2026-01-07 11:47:19.735
cmk3yeipj0023vniw4xy3lmum	cmk3ydfta000qvnx8erconpzd	VACATION	2024-03-15 00:00:00	2024-03-20 00:00:00	Family vacation	APPROVED	cmk3ydewz000gvnx82cy8zbhf	2026-01-07 11:47:19.734	\N	\N	\N	\N	2026-01-07 11:47:19.735	2026-01-07 11:47:19.735
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.assignments (id, "orderId", "employeeId", "assignedDate", "startDate", "endDate", status, tier, "estimatedHours", "actualHours", notes, "createdAt", "updatedAt", "createdBy", "updatedBy", "customerActivityId", "pausedById", "processedQuantity", "startedById", "stoppedById") FROM stdin;
cmk3ydpp5001yvnx8c9yxf4jl	cmk3ydonc001uvnx8fooz5j8d	cmk3ydex0000nvnx8nxzk9gb6	2026-01-07 11:46:42.137	2024-02-01 00:00:00	2024-02-28 00:00:00	ACTIVE	PRIMARY	160.00	\N	\N	2026-01-07 11:46:42.137	2026-01-07 11:46:42.137	cmk3ydewz000gvnx82cy8zbhf	\N	\N	\N	\N	\N	\N
cmk3ydpp5001xvnx8xy6zkv50	cmk3ydonc001uvnx8fooz5j8d	cmk3ydfta000qvnx8erconpzd	2026-01-07 11:46:42.137	2024-02-01 00:00:00	2024-02-28 00:00:00	ACTIVE	PRIMARY	120.00	\N	\N	2026-01-07 11:46:42.137	2026-01-07 11:46:42.137	cmk3ydewz000gvnx82cy8zbhf	\N	\N	\N	\N	\N	\N
cmk3yeig2001yvniw6n42fq2j	cmk3ydonc001uvnx8fooz5j8d	cmk3ydex0000nvnx8nxzk9gb6	2026-01-07 11:47:19.395	2024-02-01 00:00:00	2024-02-28 00:00:00	ACTIVE	PRIMARY	160.00	\N	\N	2026-01-07 11:47:19.395	2026-01-07 11:47:19.395	cmk3ydewz000gvnx82cy8zbhf	\N	\N	\N	\N	\N	\N
cmk3yeig2001xvniwqysnnhuv	cmk3ydonc001uvnx8fooz5j8d	cmk3ydfta000qvnx8erconpzd	2026-01-07 11:47:19.395	2024-02-01 00:00:00	2024-02-28 00:00:00	ACTIVE	PRIMARY	120.00	\N	\N	2026-01-07 11:47:19.395	2026-01-07 11:47:19.395	cmk3ydewz000gvnx82cy8zbhf	\N	\N	\N	\N	\N	\N
cmk3zcf7w0008vnocexg6xvc9	cmk3zccsv0004vnockz5pp55t	cmk3ydfta000qvnx8erconpzd	2026-01-07 12:13:41.514	2026-01-22 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-01-07 12:13:41.516	2026-01-07 12:13:41.516	\N	\N	\N	\N	\N	\N	\N
cmk41ep1b0004kz04nn1ldnam	cmk41ent80000kz04k08vcq9m	cmk3ydfta000qvnx8erconpzd	2026-01-07 13:11:26.783	2026-01-16 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-01-07 13:11:26.784	2026-01-07 13:11:26.784	\N	\N	\N	\N	\N	\N	\N
cmks9lp6q000ajm0475b7asah	cmks9lo170006jm04wa05u0pf	cmk3ydfta000qvnx8erconpzd	2026-01-24 12:07:18.722	2026-01-26 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-01-24 12:07:18.723	2026-01-24 12:07:18.723	\N	\N	\N	\N	\N	\N	\N
cmkuy28jt0006jr04f5opwibq	cmkuy27pb0004jr04wgirjv21	cmk3ydewx000evnx8xrox75n2	2026-01-26 09:07:33.448	2026-01-22 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-01-26 09:07:33.449	2026-01-26 09:07:33.449	\N	\N	\N	\N	\N	\N	\N
cmky0fyx50004vn84of1mwxj9	cmky0fwkl0000vn84sl2ul7cy	cmk3ydfta000qvnx8erconpzd	2026-01-28 12:37:31.911	2026-01-31 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-01-28 12:37:31.913	2026-01-28 12:37:31.913	\N	\N	\N	\N	\N	\N	\N
cml2hx5wr0006jj04h3lukta4	cml2hx4mi0000jj04e9bu48ai	cmk3ydfta000qvnx8erconpzd	2026-01-31 15:57:52.299	2026-02-01 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-01-31 15:57:52.3	2026-01-31 15:57:52.3	\N	\N	\N	\N	\N	\N	\N
cml2i4gye000yjj04molifl82	cml2i2j9r0018l704p66lmkfp	cmk3ydfta000qvnx8erconpzd	2026-01-31 16:03:33.207	\N	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-01-31 16:03:33.207	2026-01-31 16:03:33.207	\N	\N	\N	\N	\N	\N	\N
cmlq6vzna000avn7o536znx6d	cmlq6vwvj0000vn7olwz1gidq	cmk3ydfta000qvnx8erconpzd	2026-02-17 05:55:29.973	2026-02-28 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-02-17 05:55:29.974	2026-02-17 05:55:29.974	\N	\N	\N	\N	\N	\N	\N
cmlql544g000avnd4rm7l0cjq	cmlql50o00000vnd4ggiyfpbt	cmk3ydewx000evnx8xrox75n2	2026-02-17 12:34:30.302	2026-02-28 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-02-17 12:34:30.304	2026-02-17 12:34:30.304	\N	\N	\N	\N	\N	\N	\N
cmlql5493000cvnd4jppuj6z5	cmlql50o00000vnd4ggiyfpbt	cmk3ydfta000qvnx8erconpzd	2026-02-17 12:34:30.301	2026-02-28 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-02-17 12:34:30.304	2026-02-17 12:34:30.304	\N	\N	\N	\N	\N	\N	\N
cmm0emk6z0006vn8854bquxll	cmm0emida0002vn889jt5n9e2	cmk3ydfta000qvnx8erconpzd	2026-02-24 09:29:48.729	2026-02-28 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-02-24 09:29:48.731	2026-02-24 09:29:48.731	\N	\N	\N	\N	\N	\N	\N
cmm3roudg0004vn1k9jac4emb	cmm3roslh0000vn1kq65f4csz	cmk3ydfta000qvnx8erconpzd	2026-02-26 17:58:48.771	2026-02-28 04:00:00	\N	ASSIGNED	PRIMARY	\N	\N	\N	2026-02-26 17:58:48.773	2026-02-26 17:58:48.773	\N	\N	\N	\N	\N	\N	\N
cmm3rpyv8000kvn1kmz29sm7b	cmlqjizv70000kw04gnojumut	cmk3ydfta000qvnx8erconpzd	2026-02-26 17:59:41.25	2026-04-02 14:40:36.258	\N	ACTIVE	PRIMARY	\N	0.03	\N	2026-02-26 17:59:41.252	2026-04-02 14:40:36.259	\N	\N	\N	cmk3ydft9000ovnx8svln1xtu	\N	cmk3ydft9000ovnx8svln1xtu	\N
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_logs (id, "tableName", "recordId", action, "oldData", "newData", changes, "userId", "timestamp", "ipAddress", "userAgent") FROM stdin;
\.


--
-- Data for Name: container_articles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.container_articles (id, "containerId", "articleName", quantity, price, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: container_employees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.container_employees (id, "containerId", "employeeId", "assignedAt", role, "completedAt", "isCompleted", notes, "reportedArticleQuantity", "reportedCartonQuantity") FROM stdin;
cmlq6xdp3000ivn7ozgpq7gad	cmlq6vyt10004vn7ogh8zgioa	cmk3ydfta000qvnx8erconpzd	2026-02-17 05:56:34.84	\N	2026-02-17 05:57:43.988	t	\N	3	15
cmlq6zxo10018vn7ollbak8co	cmlq6vz1u0006vn7obejarrfk	cmk3ydfta000qvnx8erconpzd	2026-02-17 05:58:34.033	\N	2026-02-17 05:58:43.887	t	\N	4	20
cmlq70cln001fvn7owde5z1i3	cmlq6vz660008vn7o86kwgin8	cmk3ydfta000qvnx8erconpzd	2026-02-17 05:58:53.387	\N	2026-02-17 05:59:04.103	t	\N	5	25
cmlqm14z5001evnd4g3s3lvcd	cmlql52n90004vnd4i7ncxnwl	cmk3ydewx000evnx8xrox75n2	2026-02-17 12:59:24.401	\N	\N	f	\N	0	0
cmltiipp90001l704hg2wdzz6	cmlql52vz0006vnd4645aghvg	cmk3ydfta000qvnx8erconpzd	2026-02-19 13:44:24.477	\N	2026-02-19 13:44:40.156	t	\N	7	22
cmltijbfu0003l70492nejxlj	cmlql53ht0008vnd4gs1ea8jd	cmk3ydfta000qvnx8erconpzd	2026-02-19 13:44:52.65	\N	2026-02-19 13:45:02.113	t	\N	14	27
cmlqlsl5a000nvnd4rztw7vfw	cmlql52n90004vnd4i7ncxnwl	cmk3ydfta000qvnx8erconpzd	2026-02-17 12:52:45.454	\N	2026-02-19 13:45:15.151	t	\N	5	18
\.


--
-- Data for Name: containers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.containers (id, "serialNumber", "orderId", "cartonQuantity", "articleQuantity", "cartonPrice", "articlePrice", "createdAt", "updatedAt") FROM stdin;
cml2hx5lk0004jj04d4lwi1ei	CONT-1769875003283	cml2hx4mi0000jj04e9bu48ai	15	3	20.00	15.00	2026-01-31 15:57:51.896	2026-01-31 15:57:51.896
cml2i2k8c001cl704064a310c	CONT-1769875293336	cml2i2j9r0018l704p66lmkfp	25	5	150.00	0.00	2026-01-31 16:02:04.141	2026-01-31 16:02:04.141
cmlq6vyt10004vn7ogh8zgioa	CONT-1771307693558	cmlq6vwvj0000vn7olwz1gidq	15	3	20.00	15.00	2026-02-17 05:55:28.886	2026-02-17 05:55:28.886
cmlq6vz1u0006vn7obejarrfk	CONT-1771307694846	cmlq6vwvj0000vn7olwz1gidq	20	4	20.00	15.00	2026-02-17 05:55:29.202	2026-02-17 05:55:29.202
cmlq6vz660008vn7o86kwgin8	CONT-1771307695314	cmlq6vwvj0000vn7olwz1gidq	25	5	30.00	15.00	2026-02-17 05:55:29.358	2026-02-17 05:55:29.358
cmlql52n90004vnd4i7ncxnwl	CONT-1771331632241	cmlql50o00000vnd4ggiyfpbt	18	5	20.00	15.00	2026-02-17 12:34:28.389	2026-02-17 12:34:28.389
cmlql52vz0006vnd4645aghvg	CONT-1771331633063	cmlql50o00000vnd4ggiyfpbt	22	7	30.00	15.00	2026-02-17 12:34:28.703	2026-02-17 12:34:28.703
cmlql53ht0008vnd4gs1ea8jd	CONT-1771331633515	cmlql50o00000vnd4ggiyfpbt	27	14	30.00	15.00	2026-02-17 12:34:29.489	2026-02-17 12:34:29.489
cmlrmezaz0006ju04hwiw2vd2	CONT-1771394233951	cmlrmey390000ju04avomywtl	15	5	100.00	0.00	2026-02-18 05:57:56.411	2026-02-18 05:57:56.411
cmlrmezfi0008ju04sbe0izgg	CONT-1771394238392	cmlrmey390000ju04avomywtl	20	8	100.00	0.00	2026-02-18 05:57:56.574	2026-02-18 05:57:56.574
cmlrmezhp000aju04bjhz84m0	CONT-1771394249063	cmlrmey390000ju04avomywtl	22	15	150.00	0.00	2026-02-18 05:57:56.653	2026-02-18 05:57:56.653
cmlrmezjw000cju04s2dl0r9s	CONT-1771394249721	cmlrmey390000ju04avomywtl	27	13	150.00	0.00	2026-02-18 05:57:56.732	2026-02-18 05:57:56.732
cmlrnva35000kvn10vio32k9q	CONT-1771396674497	cmlrnv8l5000gvn10ecpi1byh	11	5	25.00	15.00	2026-02-18 06:38:36.497	2026-02-18 06:38:36.497
cmlrnvabf000mvn10teithcgp	CONT-1771396675107	cmlrnv8l5000gvn10ecpi1byh	22	6	30.00	15.00	2026-02-18 06:38:36.795	2026-02-18 06:38:36.795
cmlrnvafo000ovn108i48tblg	CONT-1771396675548	cmlrnv8l5000gvn10ecpi1byh	33	7	40.00	15.00	2026-02-18 06:38:36.948	2026-02-18 06:38:36.948
cmlrnvaju000qvn10b2bhxk8c	CONT-1771396675870	cmlrnv8l5000gvn10ecpi1byh	44	9	50.00	15.00	2026-02-18 06:38:37.099	2026-02-18 06:38:37.099
cmlrnvao0000svn103udcf7m4	CONT-1771396676195	cmlrnv8l5000gvn10ecpi1byh	51	22	50.00	15.00	2026-02-18 06:38:37.248	2026-02-18 06:38:37.248
cmm0emjki0004vn88gfgmifu0	CONT-1771925368272	cmm0emida0002vn889jt5n9e2	1	1	0.00	0.00	2026-02-24 09:29:47.923	2026-02-24 09:29:47.923
cmm3rots30002vn1khokzugn0	CONT-1772128710350	cmm3roslh0000vn1kq65f4csz	3	3	0.00	0.00	2026-02-26 17:58:48.003	2026-02-26 17:58:48.003
cmm3rpxtl000evn1kavzsz7bf	CONT-1771328891978	cmlqjizv70000kw04gnojumut	17	3	0.00	0.00	2026-02-26 17:59:39.898	2026-02-26 17:59:39.898
cmm3rpy1y000gvn1kyqtfqc6w	CONT-1771328892950	cmlqjizv70000kw04gnojumut	22	6	0.00	0.00	2026-02-26 17:59:40.199	2026-02-26 17:59:40.199
cmm3rpy64000ivn1kbnwmx9e2	CONT-1771328893404	cmlqjizv70000kw04gnojumut	25	10	0.00	0.00	2026-02-26 17:59:40.349	2026-02-26 17:59:40.349
\.


--
-- Data for Name: customer_activities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_activities (id, "customerId", "orderId", name, type, code, description, unit, quantity, "unitPrice", "lineTotal", "isActive", "createdAt", "updatedAt", "basePrice", "articleBasePrice") FROM stdin;
cmk3yegw9001ivniwk8sfb7lq	cmk3ydjet000xvnx8wdteoeq3	\N	Repacking	REPACKING	RP001	Repacking items for distribution	hour	\N	\N	\N	t	2026-01-07 11:47:17.385	2026-01-07 11:47:17.385	0.00	0.00
cmk3zcem30006vnocsb11wf8y	cmk3ydjet000yvnx895zjnz1q	cmk3zccsv0004vnockz5pp55t	Container Unloading	CONTAINER_UNLOADING	ck001	\N	hour	15	1000.00	1000.00	t	2026-01-07 12:13:40.731	2026-01-07 12:13:40.731	0.00	0.00
cmk41eoqc0002kz048c4w9a33	cmk3ydjet000yvnx895zjnz1q	cmk41ent80000kz04k08vcq9m	Container Unloading	CONTAINER_UNLOADING	ck001	\N	hour	325	1000.00	1000.00	t	2026-01-07 13:11:26.388	2026-01-07 13:11:26.388	0.00	0.00
cmk89euj20002vnycwsve9il9	cmk3ydjet000yvnx895zjnz1q	cmk89estt0000vnyc7omj1l1g	Container Unloading	CONTAINER_UNLOADING	ck001	\N	hour	23	1000.00	1000.00	t	2026-01-10 12:06:35.533	2026-01-10 12:06:35.533	0.00	0.00
cmks9lovp0008jm04h2bqtv3k	cmk3ydjet000yvnx895zjnz1q	cmks9lo170006jm04wa05u0pf	Labeling	LABELING	lb001	\N	Container	560	2000.00	2000.00	t	2026-01-24 12:07:18.326	2026-01-24 12:07:18.326	0.00	0.00
cmlq6vyk80002vn7osunflsq8	cmk3ydjet000yvnx895zjnz1q	cmlq6vwvj0000vn7olwz1gidq	Container Loading	CONTAINER_LOADING	ck001	\N	kg	60	25.00	25.00	t	2026-02-17 05:55:28.569	2026-02-17 05:55:28.569	0.00	0.00
cmky0fyb70002vn84r0vyvxo3	cmk3ydjet000yvnx895zjnz1q	cmky0fwkl0000vn84sl2ul7cy	Container Unloading	CONTAINER_UNLOADING	cu001	\N	TON	555	2000.00	2000.00	t	2026-01-28 12:37:31.123	2026-01-28 12:37:31.123	0.00	0.00
cml2hx5h40002jj04r8pz1zvc	cmk3ydjet000yvnx895zjnz1q	cml2hx4mi0000jj04e9bu48ai	Container Loading	CONTAINER_LOADING	ck001	\N	kg	15	20.00	20.00	t	2026-01-31 15:57:51.737	2026-01-31 15:57:51.737	0.00	0.00
cml2i2k40001al704xlz0zcw0	cmk3ydjet000yvnx895zjnz1q	cml2i2j9r0018l704p66lmkfp	Container Unloading	CONTAINER_UNLOADING	ck001r	\N	kg	25	150.00	150.00	t	2026-01-31 16:02:03.984	2026-01-31 16:02:03.984	15.00	0.00
cmk3yegip001evniwsyqp5ayo	cmk3ydjet000xvnx8wdteoeq3	\N	Container Unloading	CONTAINER_UNLOADING	CU001	Unloading containers from trucks	hour	\N	\N	\N	t	2026-01-07 11:47:16.897	2026-01-31 22:26:59.226	0.00	0.00
cml4z8jyx0002l404ki88xoi5	cml4z5pys0000l404sp101mq8	\N	Entladung	CONTAINER_UNLOADING	\N	\N	Container	\N	\N	\N	t	2026-02-02 09:38:09.562	2026-02-02 09:38:09.562	0.00	0.01
cmlql52ej0002vnd4id2s0yyb	cmk3ydjet000yvnx895zjnz1q	cmlql50o00000vnd4ggiyfpbt	Container Loading	CONTAINER_LOADING	ck001	\N	kg	67	25.00	25.00	t	2026-02-17 12:34:28.075	2026-02-17 12:34:28.075	0.00	0.00
cmlrmez6k0004ju04xw1dqhv9	cmk3ydjet000yvnx895zjnz1q	cmlrmey390000ju04avomywtl	Container Unloading	CONTAINER_UNLOADING	ck001r	\N	kg	84	25.00	25.00	t	2026-02-18 05:57:56.252	2026-02-18 05:57:56.252	15.00	0.00
cmlrmw8xu0001vnkcnc87s8ft	cmk3ydjet000yvnx895zjnz1q	\N	Container Loading	CONTAINER_LOADING	cl001	\N	kg	\N	\N	\N	t	2026-02-18 06:11:22.049	2026-02-18 06:11:22.049	0.00	15.00
cmlrnqzfh0001vn1053wdy0ge	cmk3ydjet000yvnx895zjnz1q	\N	Container Unloadinng	CONTAINER_UNLOADING	cu001	\N	kg	\N	\N	\N	t	2026-02-18 06:35:16.058	2026-02-18 06:35:16.058	0.00	20.00
cmlrnv9uv000ivn101w79ba6z	cmk3ydjet000yvnx895zjnz1q	cmlrnv8l5000gvn10ecpi1byh	Container Loading	CONTAINER_LOADING	cl001	\N	kg	161	25.00	25.00	t	2026-02-18 06:38:36.199	2026-02-18 06:38:36.199	0.00	15.00
cmm0elqfs0001vn88mnur86tn	cmk3ydjet000yvnx895zjnz1q	\N	ckiior	CONTAINER_UNLOADING	ck001	\N	hour	\N	\N	\N	t	2026-02-24 09:29:10.164	2026-02-24 09:29:10.164	0.00	0.00
cmm3rpxcf000cvn1kdrr17sja	cmk3ydjet000yvnx895zjnz1q	cmlqjizv70000kw04gnojumut	Container Unloadinng	CONTAINER_UNLOADING	cu001	\N	kg	64	60.00	60.00	t	2026-02-26 17:59:39.28	2026-02-26 17:59:39.28	0.00	20.00
\.


--
-- Data for Name: customer_description_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_description_templates (id, "customerId", "templateLines", "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: customer_prices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_prices (id, "customerId", "customerActivityId", "minQuantity", "maxQuantity", price, currency, "effectiveFrom", "effectiveTo", "isActive", "createdAt", "updatedAt") FROM stdin;
cmlrnqzo10003vn10iysnjeja	cmk3ydjet000yvnx895zjnz1q	cmlrnqzfh0001vn1053wdy0ge	1	10	10.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:35:16.368	2026-02-18 06:35:16.368
cmlrnqzo10005vn106ua8kklt	cmk3ydjet000yvnx895zjnz1q	cmlrnqzfh0001vn1053wdy0ge	12	20	20.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:35:16.368	2026-02-18 06:35:16.368
cmlrnqzo10007vn10eos8jril	cmk3ydjet000yvnx895zjnz1q	cmlrnqzfh0001vn1053wdy0ge	21	30	30.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:35:16.368	2026-02-18 06:35:16.368
cmlrnqzo20009vn10c1qler6e	cmk3ydjet000yvnx895zjnz1q	cmlrnqzfh0001vn1053wdy0ge	31	40	40.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:35:16.368	2026-02-18 06:35:16.368
cmlrnqzo2000bvn10ypnrrp2n	cmk3ydjet000yvnx895zjnz1q	cmlrnqzfh0001vn1053wdy0ge	41	50	50.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:35:16.368	2026-02-18 06:35:16.368
cmlrnqzo2000dvn10stllcb9n	cmk3ydjet000yvnx895zjnz1q	cmlrnqzfh0001vn1053wdy0ge	51	99999	60.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:35:16.368	2026-02-18 06:35:16.368
cmlrnv771000fvn10s8nzp9ku	cmk3ydjet000yvnx895zjnz1q	cmlrmw8xu0001vnkcnc87s8ft	1	999999	25.00	EUR	2026-02-18 06:38:32.748	\N	t	2026-02-18 06:38:32.749	2026-02-18 06:38:32.749
cml2vte3u0001l504op96y89c	cmk3ydjet000xvnx8wdteoeq3	cmk3yegip001evniwsyqp5ayo	351	600	600.00	EUR	2024-01-02 00:00:00	\N	t	2026-01-31 22:26:50.922	2026-01-31 22:26:50.922
cml2vte6d0001la04sp67a7ds	cmk3ydjet000xvnx8wdteoeq3	cmk3yegip001evniwsyqp5ayo	1	1000	350.00	EUR	2024-01-01 00:00:00	\N	t	2026-01-31 22:26:51.014	2026-01-31 22:26:51.014
cml4z8kw40004l404sxy959h8	cml4z5pys0000l404sp101mq8	cml4z8jyx0002l404ki88xoi5	1	1000	600.00	EUR	2026-02-02 00:00:00	\N	t	2026-02-02 09:38:10.757	2026-02-02 09:38:10.757
cml4z8kz30006l4049irwgje7	cml4z5pys0000l404sp101mq8	cml4z8jyx0002l404ki88xoi5	1001	2000	800.00	EUR	2026-02-02 00:00:00	\N	t	2026-02-02 09:38:10.863	2026-02-02 09:38:10.863
cmlrmwa1a0003vnkc06otygwd	cmk3ydjet000yvnx895zjnz1q	cmlrmw8xu0001vnkcnc87s8ft	12	20	20.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:11:23.47	2026-02-18 06:11:23.47
cmlrmwa290005vnkcw0tym79t	cmk3ydjet000yvnx895zjnz1q	cmlrmw8xu0001vnkcnc87s8ft	1	10	10.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:11:23.505	2026-02-18 06:11:23.505
cmlrmwa4g0007vnkc0say2u42	cmk3ydjet000yvnx895zjnz1q	cmlrmw8xu0001vnkcnc87s8ft	21	30	30.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:11:23.584	2026-02-18 06:11:23.584
cmlrmwa8i0009vnkcg9tpcb5a	cmk3ydjet000yvnx895zjnz1q	cmlrmw8xu0001vnkcnc87s8ft	31	40	40.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:11:23.73	2026-02-18 06:11:23.73
cmlrmwacl000bvnkcybrwmgix	cmk3ydjet000yvnx895zjnz1q	cmlrmw8xu0001vnkcnc87s8ft	41	999999	50.00	EUR	2026-02-18 00:00:00	\N	t	2026-02-18 06:11:23.877	2026-02-18 06:11:23.877
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, "companyName", "contactEmail", "contactPhone", address, "isActive", industry, "taxNumber", "userId", "createdAt", "updatedAt") FROM stdin;
cmk3ydjet000xvnx8wdteoeq3	Tech Solutions Inc	contact@techsolutions.com	+1-555-1001	{"zip": "94000", "city": "Silicon Valley", "state": "CA", "street": "100 Tech Park"}	t	Technology	TAX001	\N	2026-01-07 11:46:33.989	2026-01-07 11:46:33.989
cmk3ydjet000yvnx895zjnz1q	Global Marketing Corp	info@globalmarketing.com	+1-555-2001	{"zip": "10001", "city": "New York", "state": "NY", "street": "200 Marketing Ave"}	t	Marketing	TAX002	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-07 11:46:33.989	2026-01-07 12:17:50.952
cml4z5pys0000l404sp101mq8	Mostafa Test	mostafa@matar.de	+4915758379093	{"street": "Ludwig-Erhard-Straße 18"}	t	\N	\N	\N	2026-02-02 09:35:57.364	2026-02-02 09:36:04.027
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.departments (id, name, description, code, "isActive", "parentId", "createdAt", "updatedAt") FROM stdin;
cmk3ydbpd0000vnx84l48cyad	Finance	Finance Department	FIN	t	\N	2026-01-07 11:46:23.997	2026-01-07 11:46:23.997
cmk3ydck70001vnx8kg7oosh6	Marketing	Marketing Department	MKT	t	\N	2026-01-07 11:46:23.997	2026-01-07 11:46:23.997
cmk3ydckz0002vnx8m8j4soga	Human Resources	HR Department	HR	t	\N	2026-01-07 11:46:23.997	2026-01-07 11:46:23.997
cmk3ydcl10003vnx86mata0xd	Information Technology	IT Department	IT	t	\N	2026-01-07 11:46:23.997	2026-01-07 11:46:23.997
\.


--
-- Data for Name: employee_performance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employee_performance (id, "employeeId", "periodStart", "periodEnd", score, "trafficLight", "trafficLightReason", metrics, "manualOverride", "manualOverrideById", "createdAt", "updatedAt") FROM stdin;
cmk3ydsk4002mvnx81fbaagmb	cmk3ydewx000evnx8xrox75n2	2024-01-01 00:00:00	2024-01-31 00:00:00	55.00	RED	Below expectations, needs improvement in multiple areas	{"quality": 0.7, "teamwork": 0.8, "efficiency": 0.65, "punctuality": 0.75}	f	\N	2026-01-07 11:46:45.844	2026-01-07 11:46:45.844
cmk3ydsk3002kvnx8t8m1c1ln	cmk3ydfta000qvnx8erconpzd	2023-12-01 00:00:00	2023-12-31 00:00:00	75.00	YELLOW	Good performance but room for improvement in efficiency	{"quality": 0.9, "teamwork": 0.92, "efficiency": 0.88, "punctuality": 0.85}	f	\N	2026-01-07 11:46:45.844	2026-01-07 11:46:45.844
cmk3ydsk3002ivnx83x2cijd9	cmk3ydfta000qvnx8erconpzd	2024-01-01 00:00:00	2024-01-31 00:00:00	92.00	GREEN	Excellent performance with high efficiency and quality	{"quality": 0.92, "teamwork": 0.9, "efficiency": 0.95, "punctuality": 0.98}	f	\N	2026-01-07 11:46:45.844	2026-01-07 11:46:45.844
cmk3yelca002kvniwy36ik9gw	cmk3ydfta000qvnx8erconpzd	2023-12-01 00:00:00	2023-12-31 00:00:00	75.00	YELLOW	Good performance but room for improvement in efficiency	{"quality": 0.9, "teamwork": 0.92, "efficiency": 0.88, "punctuality": 0.85}	f	\N	2026-01-07 11:47:23.146	2026-01-07 11:47:23.146
cmk3yelcb002mvniwuar4rwil	cmk3ydfta000qvnx8erconpzd	2024-01-01 00:00:00	2024-01-31 00:00:00	92.00	GREEN	Excellent performance with high efficiency and quality	{"quality": 0.92, "teamwork": 0.9, "efficiency": 0.95, "punctuality": 0.98}	f	\N	2026-01-07 11:47:23.146	2026-01-07 11:47:23.146
cmk3yelca002lvniwxzln445w	cmk3ydewx000evnx8xrox75n2	2024-01-01 00:00:00	2024-01-31 00:00:00	55.00	RED	Below expectations, needs improvement in multiple areas	{"quality": 0.7, "teamwork": 0.8, "efficiency": 0.65, "punctuality": 0.75}	f	\N	2026-01-07 11:47:23.146	2026-01-07 11:47:23.146
\.


--
-- Data for Name: employee_qualifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employee_qualifications (id, "employeeId", "qualificationId", "acquiredDate", "expiryDate", "certificateUrl", "isVerified", "proficiencyLevel", "createdAt", "updatedAt") FROM stdin;
cmk3ydm5o001bvnx8vzlcjuy5	cmk3ydfta000qvnx8erconpzd	cmk3ydkg6000zvnx84fzkv296	2026-01-07 11:46:37.548	\N	\N	t	4	2026-01-07 11:46:37.548	2026-01-07 11:46:37.548
cmk3ydm5o001avnx81d009c3j	cmk3ydewx000evnx8xrox75n2	cmk3ydkg60010vnx81aa45x3o	2026-01-07 11:46:37.549	\N	\N	t	4	2026-01-07 11:46:37.549	2026-01-07 11:46:37.549
cmk3ydm5o001cvnx85pkw6o07	cmk3ydex0000nvnx8nxzk9gb6	cmk3ydkg6000zvnx84fzkv296	2026-01-07 11:46:37.548	\N	\N	t	5	2026-01-07 11:46:37.548	2026-01-07 11:46:37.548
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employees (id, "employeeCode", "firstName", "lastName", "phoneNumber", "dateOfBirth", address, "emergencyContact", "hireDate", "terminationDate", "departmentId", "positionId", "managerId", "scheduleType", "hourlyRate", salary, "isAvailable", priority, "blockedAt", "blockedReason", "performanceScore", "trafficLight", "userId", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
cmk3ydex0000lvnx858c11eip	EMP005	Alex	Leader	+1-555-0501	1987-09-12 00:00:00	555 Leader Lane, City, State 12345	{"name": "Sam Leader", "phone": "+1-555-0502", "relationship": "Partner"}	2023-01-20 00:00:00	\N	cmk3ydcl10003vnx86mata0xd	cmk3yddkj000avnx89xy97jw7	\N	FULL_TIME	\N	80000.00	t	1	\N	\N	\N	\N	cmk3ydewz000fvnx8kiidz4gy	2026-01-07 11:46:28.163	2026-01-07 11:46:28.163	\N	\N
cmk3ydex0000nvnx8nxzk9gb6	EMP001	John	Admin	+1-555-0101	1985-03-20 00:00:00	123 Admin St, City, State 12345	{"name": "Jane Admin", "phone": "+1-555-0102", "relationship": "Spouse"}	2023-01-15 00:00:00	\N	cmk3ydcl10003vnx86mata0xd	cmk3yddkj000avnx89xy97jw7	\N	FULL_TIME	\N	75000.00	t	1	\N	\N	\N	\N	cmk3ydex0000jvnx8bfxoe0g7	2026-01-07 11:46:28.164	2026-01-07 11:46:28.164	\N	\N
cmk3ydex0000kvnx8ectpbni8	EMP002	Sarah	Johnson	+1-555-0201	1988-07-15 00:00:00	456 HR Ave, City, State 12345	{"name": "Mike Johnson", "phone": "+1-555-0202", "relationship": "Husband"}	2023-02-01 00:00:00	\N	cmk3ydckz0002vnx8m8j4soga	cmk3yddkj000bvnx8abfm98ds	\N	FULL_TIME	\N	70000.00	t	2	\N	\N	\N	\N	cmk3ydewz000gvnx82cy8zbhf	2026-01-07 11:46:28.163	2026-01-07 11:46:28.163	\N	\N
cmk3ydfta000qvnx8erconpzd	EMP003	Mike	Developer	+1-555-0301	1992-11-08 00:00:00	789 Dev Rd, City, State 12345	{"name": "Lisa Developer", "phone": "+1-555-0302", "relationship": "Sister"}	2023-03-10 00:00:00	\N	cmk3ydcl10003vnx86mata0xd	cmk3yddkj000avnx89xy97jw7	\N	FULL_TIME	\N	65000.00	t	3	\N	\N	92.00	GREEN	cmk3ydft9000ovnx8svln1xtu	2026-01-07 11:46:28.166	2026-01-07 11:47:24.104	\N	\N
cmk3ydewx000evnx8xrox75n2	EMP004	Emma	Analyst	+1-555-0401	1990-05-22 00:00:00	321 Finance Blvd, City, State 12345	{"name": "Tom Analyst", "phone": "+1-555-0402", "relationship": "Father"}	2023-04-05 00:00:00	\N	cmk3ydbpd0000vnx84l48cyad	cmk3yddkj0008vnx8b363lbl3	\N	FULL_TIME	\N	55000.00	t	4	\N	\N	55.00	RED	cmk3ydeww000cvnx8ql15tc69	2026-01-07 11:46:28.16	2026-01-07 11:47:24.104	\N	\N
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.files (id, filename, "originalName", "mimeType", size, path, "documentType", description, "expiryDate", "employeeId", "orderId", "assignmentId", "uploadedBy", "isVerified", "isPublic", "createdAt", "updatedAt") FROM stdin;
cmk3ydstv002svnx8f0jfdjw3	certificate_javascript.jpg	JavaScript_Certificate.jpg	image/jpeg	156672	/uploads/certificate_javascript.jpg	CERTIFICATE	JavaScript programming certification	2026-12-31 00:00:00	cmk3ydfta000qvnx8erconpzd	\N	\N	cmk3ydft9000ovnx8svln1xtu	f	f	2026-01-07 11:46:46.195	2026-01-07 11:46:46.195
cmk3ydstu002qvnx8dmnv2gdw	contract_mike_developer.pdf	Employment_Contract_Mike.pdf	application/pdf	189440	/uploads/contract_mike_developer.pdf	CONTRACT	Employment contract	\N	cmk3ydfta000qvnx8erconpzd	\N	\N	cmk3ydewz000gvnx82cy8zbhf	t	f	2026-01-07 11:46:46.194	2026-01-07 11:46:46.194
cmk3ydstu002pvnx89z2ncict	resume_john_admin.pdf	John_Admin_Resume.pdf	application/pdf	245760	/uploads/resume_john_admin.pdf	RESUME	Employee resume and CV	\N	cmk3ydex0000nvnx8nxzk9gb6	\N	\N	cmk3ydewz000gvnx82cy8zbhf	t	f	2026-01-07 11:46:46.194	2026-01-07 11:46:46.194
cmk3yellr002qvniwcmkgwcj7	resume_john_admin.pdf	John_Admin_Resume.pdf	application/pdf	245760	/uploads/resume_john_admin.pdf	RESUME	Employee resume and CV	\N	cmk3ydex0000nvnx8nxzk9gb6	\N	\N	cmk3ydewz000gvnx82cy8zbhf	t	f	2026-01-07 11:47:23.487	2026-01-07 11:47:23.487
cmk3yellr002rvniwtx3r5hi5	certificate_javascript.jpg	JavaScript_Certificate.jpg	image/jpeg	156672	/uploads/certificate_javascript.jpg	CERTIFICATE	JavaScript programming certification	2026-12-31 00:00:00	cmk3ydfta000qvnx8erconpzd	\N	\N	cmk3ydft9000ovnx8svln1xtu	f	f	2026-01-07 11:47:23.487	2026-01-07 11:47:23.487
cmk3yellr002svniw7xonq1tq	contract_mike_developer.pdf	Employment_Contract_Mike.pdf	application/pdf	189440	/uploads/contract_mike_developer.pdf	CONTRACT	Employment contract	\N	cmk3ydfta000qvnx8erconpzd	\N	\N	cmk3ydewz000gvnx82cy8zbhf	t	f	2026-01-07 11:47:23.487	2026-01-07 11:47:23.487
\.


--
-- Data for Name: notification_outbox; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_outbox (id, "notificationId", payload, channel, attempts, "maxAttempts", "lockedUntil", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_preferences (id, "userId", channels, "quietHoursStart", "quietHoursEnd", "digestEnabled", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_recipients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_recipients (id, "notificationId", "userId", channels, "readAt", "seenAt", "isArchived", status, error, "createdAt") FROM stdin;
cmkxuu2wy0006vnb4dgax15x5	cmkxuu2wx0004vnb4e0lg3cuo	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 10:00:32.577
cmk41esbw000akz04u1tayy47	cmk41esbw0008kz04mzijhdga	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-07 13:12:06.273	\N	f	SENT	\N	2026-01-07 13:11:31.052
cmkxuu6kf0009vnb4ssgzalfh	cmkxuu6kf0007vnb49bxuypbx	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 10:00:37.311
cmlq6w25n000dvn7okigjmrrs	cmlq6w25n000bvn7on9u5oyvd	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 05:55:33.227
cmlq6w5y6000gvn7oenrqju36	cmlq6w5y6000evn7obslo6pp2	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 05:55:38.142
cmky0g5io000avn84sgkgo9aw	cmky0g5io0008vn84ljcbl00t	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 12:37:40.465
cmky1lhks0010vnf0w2wh5bme	cmky1lhks000yvnf02yaj4pjl	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:09:48.988
cmk89exa60005vnycalvynh7i	cmk89exa60003vnyc6xb4evz4	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-10 12:06:39.102
cmkuy29tc0009jr04g1bs6rft	cmkuy29tc0007jr04w8o9g2o2	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-01-26 09:07:35.089
cmkxuu963000cvnb4uqv5sa46	cmkxuu963000avnb4db5trbce	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 10:00:40.684
cmlq6xrsq000vvn7owgrlw2f1	cmlq6xrsq000tvn7ou8qqq6p2	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 05:56:53.114
cmkuy2ble000cjr04y2k1jwky	cmkuy2ble000ajr04zja6fazp	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-26 09:08:58.079	\N	f	SENT	\N	2026-01-26 09:07:37.395
cmk89f0qb0008vnyc7gbhn4u9	cmk89f0qb0006vnyc1scxnz3y	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-26 09:33:27.311	\N	f	SENT	\N	2026-01-10 12:06:43.571
cmks9ls98000gjm04lviz3pj3	cmks9ls98000ejm044diipj1f	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-24 12:07:22.7
cmky1l2w0000svnf0dw0b04i1	cmky1l2w0000qvnf0lvlj7wkv	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:09:29.952
cmk3zchrk000bvnocbvpea5po	cmk3zchrk0009vnocuxnatj39	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-28 09:50:36.684	\N	f	SENT	\N	2026-01-07 12:13:44.816
cmk41eqas0007kz04oa771rij	cmk41eqar0005kz04soycxdtn	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-28 09:50:36.684	\N	f	SENT	\N	2026-01-07 13:11:28.42
cmks9lqgq000djm04h7pattr0	cmks9lqgq000bjm04e4hj1h9n	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-28 09:50:36.684	\N	f	SENT	\N	2026-01-24 12:07:20.378
cmkxhmn0f0007vn1c4prdd8nb	cmkxhmn0e0005vn1cpy05o85a	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-28 09:50:36.684	\N	f	SENT	\N	2026-01-28 03:50:50.367
cmky1ljti0013vnf0kk36mjrf	cmky1ljth0011vnf0gfhadgbm	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:09:51.894
cmky1kxoc000jvnf0dxfis1bn	cmky1kxoc000hvnf08eiynix6	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:09:23.197
cmlq76u1n001vvn7oeg7uzg8p	cmlq76u1n001tvn7ougjweimc	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 06:03:55.931
cmlq7l3wu0029vn7o0jma61lq	cmlq7l3wu0027vn7ogvcq73f9	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 06:15:01.902
cmkxuudn2000ivnb4yeho93zb	cmkxuudn1000gvnb47xam5he6	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 10:00:46.478
cmkxhmrs7000avn1ckqu5ycpx	cmkxhmrs70008vn1czamm7fr4	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 03:50:56.551
cmky0s4zk000avnxsxa82d5ja	cmky0s4zk0008vnxsp2ndo03d	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 12:46:59.648
cmkxvl3xe0008vni0t560f0at	cmkxvl3xe0006vni0t7xf7f0d	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 10:21:33.602
cmky1l00p000mvnf0jmo2s1l7	cmky1l00o000kvnf06m52y88k	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:09:26.233
cmky1lmq90019vnf0vbtu78lp	cmky1lmq90017vnf0qw9e76t7	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:09:55.665
cmlq7l6q2002cvn7osxp6iphf	cmlq7l6q2002avn7o873igqgo	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 06:15:05.547
cmkxz9hp7000avn0wrqumlapi	cmkxz9hp60008vn0wycn5jgk6	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	PENDING	\N	2026-01-28 12:04:30.043
cmky2cdyi000jvno8frf3nsgn	cmky2cdyh000hvno8pinbz9r4	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:30:44.01
cmky1jgu4000cvnf0dvxnn9xv	cmky1jgu4000avnf0xelceti2	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 13:08:14.716
cmky2cg1s000mvno8siph9bwp	cmky2cg1s000kvno8b0wtk6of	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:30:46.72
cmky2cj4t000svno8nornyemd	cmky2cj4t000qvno877waq8p2	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:30:50.717
cmkxuu9cm000fvnb43o36xt5c	cmkxuu9cm000dvnb4odiufl76	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 10:00:40.918
cmlpc3kmm000il104vxiq2fq5	cmlpc3kmm000gl1047wme7o0s	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-16 15:33:35.662
cmlqjkzi10011kw04ys9sjkro	cmlqjkzi1000zkw04ly0bnwq9	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 11:50:51.578
cmlq7lfmd002lvn7ow3fygovt	cmlq7lfmd002jvn7oln9pao90	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 06:15:17.078
cmlpc8ath000zl1048l8aphbv	cmlpc8ath000xl104iid5y2yz	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-16 15:37:16.229
cmky2goiq001hvno85xhxzaxr	cmky2goiq001fvno8772z8hp5	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 13:34:04.322
cmky2gr3c001kvno8j4b4dswr	cmky2gr3c001ivno8x7q0miow	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 13:34:07.656
cmky2evdh001cvno8zki5k2my	cmky2evdh001avno81hg9xtzx	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 13:32:39.893
cmky2gths001nvno85lgit79l	cmky2gths001lvno8drdsliz8	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 13:34:10.768
cmky2gyvk001wvno8jrahpk35	cmky2gyvj001uvno883k3qe0v	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 13:34:17.744
cmky2eob30010vno81v4n34n4	cmky2eob3000yvno8min76kkj	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:32:30.735
cmky2eqda0013vno8xgm07yqz	cmky2eqda0011vno8h18gy33w	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:32:33.407
cmky2eswk0016vno8ywf6eyd9	cmky2eswk0014vno8mdyj7szz	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:32:36.692
cmky2gwkt001tvno8cwcpx65i	cmky2gwkt001rvno8v5gdt09r	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 13:34:14.766
cmlqjkyan000ykw04qm36nx7j	cmlqjkyan000wkw04qhacwbj4	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 11:50:50.015
cmlq70pta001kvn7ozpdn1se0	cmlq70pta001ivn7o18cpkb73	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 05:59:10.511
cmlpc3izz000fl1046trff880	cmlpc3izz000dl104hkg2xpsx	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-16 15:33:33.551
cmlq6xuoj0011vn7omal3jyun	cmlq6xuoj000zvn7och8yg7zn	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 05:56:56.851
cmlpc86mp000nl104p9tf72di	cmlpc86mp000ll1041cfok5mr	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-16 15:37:10.802
cmlpc87u1000ql104zvykn4vk	cmlpc87u1000ol10454iojr9l	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-16 15:37:12.362
cmlq76p01001pvn7onw5001gb	cmlq76p00001nvn7ocau3vevk	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 06:03:49.393
cmlq76xoe0021vn7o1sq44wlh	cmlq76xoe001zvn7oxow5793g	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 06:04:00.638
cmlq76red001svn7oec8pdmlt	cmlq76red001qvn7o9ssz1tiy	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 06:03:52.501
cmlqjora90013l704iub7livn	cmlqjora90011l704wvjkwrzx	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 11:53:47.553
cmlq6xs11000yvn7omlrrpduy	cmlq6xs10000wvn7oqwhbo6s3	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 05:56:53.413
cmlq6z07p0016vn7obyjnf1wn	cmlq6z07p0014vn7owcf3ooku	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 05:57:50.677
cmlq76u6x001yvn7o9ixw9hrx	cmlq76u6x001wvn7o1qhqxcim	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 06:03:56.121
cmlq708ur001dvn7ojpyg6jxf	cmlq708ur001bvn7o70o13cki	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 05:58:48.531
cmlqjoq6t0010l70422r212bg	cmlqjoq6t000yl704377d30o3	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 11:53:46.133
cmlqjnk90000pl704vdyq9bu3	cmlqjnk90000nl7045l6t0a5s	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:52:51.781
cmlqjosmb0016l7049r7ex726	cmlqjosmb0014l7040lkkg8u6	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:53:49.283
cmlqjnhpg000gl704yshemjv9	cmlqjnhpf000el704av0pcf5g	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:52:48.484
cmlqjnix8000jl704nf3iy68k	cmlqjnix8000hl7040obw9qkp	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:52:50.06
cmlpc897n000wl1043wzqmnpg	cmlpc897n000ul104464eudel	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-16 15:37:14.147
cmlqjop19000xl7048b2r6ulg	cmlqjop19000vl7049f7sdsps	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 11:53:44.638
cmlq7l0xv0026vn7o4b7iiwkq	cmlq7l0xv0024vn7os3h43mqa	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 06:14:58.052
cml0r8pxf0010vnc8jx3bu1fo	cml0r8pxf000yvnc8the12hxs	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-30 10:43:15.651
cml0xoyc6000yla045n19rxdg	cml0xoyc6000wla04qihav4t4	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 13:43:50.742
cmky3f2mt0025vno8698kluab	cmky3f2mt0023vno8106q09a0	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-28 14:00:48.917
cmlqlt1wk001cvnd4rklj54v6	cmlqlt1wk001avnd4yxgokazl	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 12:53:07.173
cml0xoya3000vla04ad6kkt0y	cml0xoya3000tla04rt556gf7	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-30 13:43:50.667
cml0xr7vq001qla04s0eba4nz	cml0xr7vq001ola04yoo2a0bc	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-30 13:45:36.422
cmlq7lazd002fvn7os2s668t5	cmlq7lazd002dvn7o0z2mldt2	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 06:15:11.065
cml0xr9yy001zla04x2nff1dt	cml0xr9yy001xla04bwoswn23	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 13:45:39.131
cml0r8kdh000rvnc8msj4gmuw	cml0r8kdg000pvnc85rr39kkv	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 10:43:08.453
cmky0s0v40007vnxsxqxkakgq	cmky0s0v40005vnxs0u3ya8bb	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 12:46:54.304
cmkxvkzip0005vni0wfp1i7ai	cmkxvkzip0003vni0e894pf07	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 10:21:27.889
cmkxz9dlu0007vn0wb8p7xjud	cmkxz9dlu0005vn0wp62cb90o	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 12:04:24.738
cmky0g1hn0007vn8484apb822	cmky0g1hm0005vn846l6ja32v	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 12:37:35.243
cmky1jcrf0009vnf0mlvzr8ph	cmky1jcrf0007vnf06b9qpz5k	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 13:08:09.436
cmky1l2vz000pvnf0o08qcip0	cmky1l2vy000nvnf0w2qeogva	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 13:09:29.951
cmky1lmq80016vnf0zoantwus	cmky1lmq80014vnf0khts0xi9	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 13:09:55.664
cmky2aqlv0009vno8s14j3611	cmky2aqlv0007vno8i30ilcgr	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 13:29:27.091
cmky2cj4p000pvno8skbm3bov	cmky2cj4p000nvno8gm6bwmb7	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 13:30:50.713
cmky2eswx0019vno8zs6fmx70	cmky2eswx0017vno8xiha3bof	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 13:32:36.705
cmky2gwko001qvno8m5pcxrpm	cmky2gwko001ovno82sdxxqjj	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-28 13:34:14.76
cml0qzkme000hvnc80d2g1ugt	cml0qzkme000fvnc88jxw4of2	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 10:37:42.316	\N	f	SENT	\N	2026-01-30 10:36:08.87
cml0r8mqm000uvnc8v6wrndok	cml0r8mqm000svnc8nyvmxr7d	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 10:43:11.518
cml0xpyzz001cla04hh6sltht	cml0xpyzz001ala043m8h3a35	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-30 13:44:38.255
cml0xnc8q000fla04yh9stn61	cml0xnc8q000dla04bmuigwdz	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-30 13:43:20.263	\N	f	SENT	\N	2026-01-30 13:42:35.45
cml0xr6yk001nla04fs14dxke	cml0xr6yk001lla04cbi65s9f	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-30 13:45:35.228
cml0xr9yy001wla04hkqpcl0l	cml0xr9yx001ula04fuq36pyx	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-30 13:45:39.13
cmlqlsswv000uvnd4ig2324wh	cmlqlsswu000svnd4lam5sph4	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-17 12:52:55.519
cmlql572o000fvnd448vplscd	cmlql572n000dvnd4o9bvfve0	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-17 12:34:34.128
cml0xvhqa000hjq040qcyi7ai	cml0xvhqa000fjq04io1moqih	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-30 13:48:55.81
cmlq7lb5b002ivn7otn19ni93	cmlq7lb5b002gvn7ofykvvkfq	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 06:15:11.279
cmlqlsyot0019vnd427vewg77	cmlqlsyot0017vnd4uagtd1sv	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-17 12:53:03.005
cmlrnvhct000yvn10mpwc90z7	cmlrnvhct000wvn107pfqmefp	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-19 07:08:03.122	\N	f	SENT	\N	2026-02-18 06:38:45.917
cml0r8px0000xvnc8x3wwveu7	cml0r8px0000vvnc8eztyrns1	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 10:43:15.637
cmlrnvd84000vvn10rr6wulul	cmlrnvd83000tvn101jy3gk7l	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-02-18 06:38:40.563
cml0xovxy000pla048mwerzpl	cml0xovxy000nla044k4sucks	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 13:43:47.638
cmlqlsygs0016vnd4x620iz18	cmlqlsygr0014vnd4k1ec52x0	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:50.019	\N	f	SENT	\N	2026-02-17 12:53:02.716
cml0xpwfb0016la041f5zbx57	cml0xpwfb0014la04o92f6uuq	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 13:44:34.919
cmltij52i0007l104qajha98s	cmltij52h0005l104xz8adql4	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-04-02 14:35:53.275	\N	f	SENT	\N	2026-02-19 13:44:44.394
cmky1l5d3000vvnf081temznd	cmky1l5d3000tvnf0xdymx7q8	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 13:09:33.16
cmky1lpcm001cvnf09rck65ko	cmky1lpcm001avnf0936rpkrv	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 13:09:59.062
cml0xowxj000sla048uf5c34o	cml0xowxj000qla04iqc31ia0	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 13:43:48.919
cmky2avn5000cvno8rfasa5j6	cmky2avn5000avno842z7dggf	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 13:29:33.617
cmky2cmrb000vvno8ljkry0rs	cmky2cmra000tvno809z8veyv	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 13:30:55.415
cml0r8ter0013vnc89dy5ly4m	cml0r8ter0011vnc8tyah41k5	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-30 10:43:20.163
cmky3f03s0022vno8sd4lo5yd	cmky3f03s0020vno8kd5octau	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-28 14:00:45.64
cml0xozyx0011la04ksv5a059	cml0xozyx000zla04wso8mytn	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-30 13:43:52.858
cml0qzoog000kvnc8h4lf3irx	cml0qzoof000ivnc8ghp6as84	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-30 10:36:14.128
cml0xne0d000ila04hnpu3md6	cml0xne0c000gla04muu0pry7	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-30 13:42:37.741
cml0xq083001ila04czeijv0f	cml0xq083001gla04b3lsgtvc	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-30 13:44:39.843
cml0xr8sy001tla041fs8027n	cml0xr8sy001rla04tazjo5j7	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-30 13:45:37.619
cml0xrb2q0022la04h5jcqwcw	cml0xrb2q0020la048szqd9vx	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	PENDING	\N	2026-01-30 13:45:40.562
cml0xt2pu0009jq04i828ic5r	cml0xt2pu0007jq048avluerm	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-30 16:53:33.167	\N	f	SENT	\N	2026-01-30 13:47:03.042
cml2hzk5n000vl704vox5h2n1	cml2hzk5n000tl704csg0wo8g	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-13 03:42:04.896	\N	f	SENT	\N	2026-01-31 15:59:44.075
cml2hykjl000el704xi2hsp4r	cml2hykjl000cl704depfsmej	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-13 03:42:04.896	\N	f	SENT	\N	2026-01-31 15:58:57.921
cml2hym1g000hl704wuv5y0d9	cml2hym1g000fl7043ndgbcyg	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-13 03:42:04.896	\N	f	SENT	\N	2026-01-31 15:58:59.86
cml2hynd1000kl704htbsoqo3	cml2hynd1000il704izal3666	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-13 03:42:04.896	\N	f	SENT	\N	2026-01-31 15:59:01.574
cml0xpz00001fla0484c6nr9p	cml0xpyzz001dla04x2nld5of	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 13:44:38.256
cml0xpxnf0019la045ewzbezg	cml0xpxnf0017la04plm5aizr	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 13:44:36.507
cml0xt48s000cjq04olm24xjj	cml0xt48s000ajq04800tvyhr	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 13:47:05.02
cml14hmz4000ajo043dis1t89	cml14hmz40008jo04fj48r8ax	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-01-30 17:41:57.425	\N	f	SENT	\N	2026-01-30 16:54:06.736
cml2i0ixx000hjj04s1ynlgwa	cml2i0ixx000fjj0408ao1iar	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-16 13:48:11.536	\N	f	SENT	\N	2026-01-31 16:00:29.158
cml2hzl00000yl7047vz1ei9y	cml2hzl00000wl704f3f2lm2y	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-13 03:42:04.896	\N	f	SENT	\N	2026-01-31 15:59:45.168
cml2hzm550011l7049tom0m57	cml2hzm55000zl704x3fpcd74	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-13 03:42:04.896	\N	f	SENT	\N	2026-01-31 15:59:46.649
cml2i0mjl000qjj04hlst5xea	cml2i0mjl000ojj04qoqi56zo	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-16 13:48:11.536	\N	f	SENT	\N	2026-01-31 16:00:33.826
cml2i0k3m000kjj04drx6hnsp	cml2i0k3l000ijj04idhrbtb7	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-16 13:48:11.536	\N	f	SENT	\N	2026-01-31 16:00:30.658
cmlpc3g420006l104h56lwrwp	cmlpc3g420004l104l221ryxu	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-16 15:33:29.811
cml2hynf9000nl704hqtsn95d	cml2hynf9000ll70400espgt6	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-31 15:59:01.654
cmlpc3hlu0009l1046qp8ioaq	cmlpc3hlu0007l1043x9flkiy	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-16 15:33:31.746
cml2hx76o0009jj041dr5g59g	cml2hx76o0007jj04c7ih729d	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-31 15:57:53.952
cmlpc895j000tl10478qworpl	cmlpc895i000rl104d24q77ur	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-16 15:37:14.071
cml2hzm580014l70409l7d4zr	cml2hzm580012l7042yewfhb2	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-01-31 15:59:51.094	\N	f	SENT	\N	2026-01-31 15:59:46.652
cmlpc3ixt000cl104bprdvsnr	cmlpc3ixt000al104un212bif	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-16 15:33:33.473
cml2i0mlp000tjj04hr6zb526	cml2i0mlp000rjj041c5igmvd	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-13 03:42:04.896	\N	f	SENT	\N	2026-01-31 16:00:33.902
cml14hlhb0007jo04ayc630t9	cml14hlhb0005jo04v2yetb28	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-31 16:01:11.054	\N	f	SENT	\N	2026-01-30 16:54:04.799
cmlq6xljm000pvn7o1m3v8djb	cmlq6xljm000nvn7ogz5idoff	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 05:56:45.01
cml2i0l7b000njj04h2t4ivl5	cml2i0l7b000ljj04x21s238o	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-31 16:01:11.054	\N	f	SENT	\N	2026-01-31 16:00:32.088
cml2hyot3000ql704jmo2a2fo	cml2hyot3000ol704g3qa2bid	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-31 16:01:11.054	\N	f	SENT	\N	2026-01-31 15:59:03.447
cml2hznlw0017l704vl7xjvar	cml2hznlw0015l704nkrqw7ri	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-31 16:01:11.054	\N	f	SENT	\N	2026-01-31 15:59:48.549
cml2i0o8u000wjj04pqyzbuxv	cml2i0o8u000ujj04lxd5kg28	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-31 16:01:11.054	\N	f	SENT	\N	2026-01-31 16:00:36.03
cmlq6xoan000svn7ol4pwk20l	cmlq6xoan000qvn7oyptpw3lz	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:47:56.893	\N	f	SENT	\N	2026-02-17 05:56:48.575
cmlqjkvqq000pkw040epgwmin	cmlqjkvqq000nkw04jzf8px1w	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:50:46.706
cmlqjj2jv000dkw049e5jc7za	cmlqjj2jv000bkw04ff44hv3l	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 11:49:22.22
cml2hx99b000cjj04028j50n1	cml2hx99a000ajj04r8iuo68o	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-31 16:01:11.054	\N	f	FAILED	\nInvalid `prisma.notificationRecipient.update()` invocation:\n\n\nCan't reach database server at `ep-green-wildflower-abnyl1wo-pooler.eu-west-2.aws.neon.tech:5432`\n\nPlease make sure your database server is running at `ep-green-wildflower-abnyl1wo-pooler.eu-west-2.aws.neon.tech:5432`.	2026-01-31 15:57:56.639
cml2i4hum0011jj04dzr1jhl7	cml2i4hum000zjj04cm8zqnol	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-16 13:48:11.536	\N	f	SENT	\N	2026-01-31 16:03:34.366
cmlp7t1ql000fl704113r5wrv	cmlp7t1qk000dl704k6r21y58	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-16 13:48:11.536	\N	f	SENT	\N	2026-02-16 13:33:26.157
cml2i2lmf001fl704jb2xvos8	cml2i2lmf001dl704h7hwtwoe	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-01-31 16:10:46.124	\N	f	SENT	\N	2026-01-31 16:02:05.943
cml2i2ms3001il704owqnqrhs	cml2i2ms3001gl704q34dfmby	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-13 03:42:04.896	\N	f	SENT	\N	2026-01-31 16:02:07.443
cmltijw0b000gl704swjncgvm	cmltijw0b000el704f9ljr5bg	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:45:19.307
cmltik6r9000rl10437749wcg	cmltik6r9000pl104e07phrf9	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:50.019	\N	f	SENT	\N	2026-02-19 13:45:33.237
cmlrmf0u0000fju04v104s7v9	cmlrmf0u0000dju04aawln1kq	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:58:07.171	\N	f	SENT	\N	2026-02-18 05:57:58.392
cmlql574i000ivnd4hr4cwgm8	cmlql574h000gvnd4oggump97	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 12:34:34.194
cmlqjnk8z000ml7040xm15do4	cmlqjnk8z000kl704hoi8g9ec	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 11:52:51.779
cmlqjosmd0019l704w3f6xfyp	cmlqjosmd0017l7043d8888q3	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-02-17 12:52:19.989	\N	f	SENT	\N	2026-02-17 11:53:49.286
cmlrmf2ej000iju048jwyxs8w	cmlrmf2ej000gju04nf532g4e	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-18 05:58:28.487	\N	f	SENT	\N	2026-02-18 05:58:00.427
cmltikyop000rl7043usglz8e	cmltikyop000pl704c7mh9np3	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:50.019	\N	f	SENT	\N	2026-02-19 13:46:09.433
cmlqlssww000xvnd4yyl509qp	cmlqlssww000vvnd45v78m9i6	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-18 06:09:47.004	\N	f	SENT	\N	2026-02-17 12:52:55.52
cmlqlsvo20010vnd4llon0wgq	cmlqlsvo2000yvnd4kfahsz9n	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-18 06:09:47.004	\N	f	SENT	\N	2026-02-17 12:52:59.09
cmlqlsybi0013vnd4duh8929v	cmlqlsybi0011vnd4sus42vy3	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-18 06:09:47.004	\N	f	SENT	\N	2026-02-17 12:53:02.526
cmlqjotvb001cl704tq9z8pmx	cmlqjotvb001al704ab4mnkhb	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 11:53:50.903
cmlqjkwyp000skw04w6lj3478	cmlqjkwyp000qkw04jqb04asp	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:50:48.29
cmlqjkyam000vkw044fg3nknb	cmlqjkyam000tkw04qw762e13	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:50:50.015
cmlqjlf850004l704v851s4jw	cmlqjlf850002l704f0bn24wj	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:51:11.957
cmlqjmqh50009l704ysh1rvqh	cmlqjmqh50007l704dzr194ky	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:52:13.194
cmlqjn9oa0018kw0438ne6oir	cmlqjn9o90016kw04ld95i6sf	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-02-17 11:54:01.404	\N	f	SENT	\N	2026-02-17 11:52:38.074
cmlqjj4b5000gkw04t7tyr2uw	cmlqjj4b5000ekw04c6qkv8nj	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 11:49:24.497
cmlp7t3rh000il70452ov1jyr	cmlp7t3rh000gl704kh2knm0s	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-16 13:33:28.782
cmlql5bnq000lvnd4mfgl57ty	cmlql5bnq000jvnd41rifhifi	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 12:34:40.071
cmlqjnlj2000sl7047d6i3tko	cmlqjnlj2000ql7047kgkw1zc	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	2026-02-18 05:56:58.746	\N	f	SENT	\N	2026-02-17 11:52:53.438
cmltij52h0004l104o8681h2z	cmltij52h0002l1040ir9xnvr	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:44:44.393
cmltik40m000fl10453dzo9d2	cmltik40m000dl104x3orjs01	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:45:29.686
cmltijm2m0008l704xlc1qre3	cmltijm2m0006l704wiipdxq1	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:45:06.431
cmltikzlv000ul70494twpjhl	cmltikzlu000sl704brcg5w50	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:50.019	\N	f	SENT	\N	2026-02-19 13:46:10.627
cmltik6p6000ol104monsaafu	cmltik6p6000ml104788xiaho	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:45:33.163
cmltik8d1000ul104nniu3dx0	cmltik8d0000sl1049vxvisuy	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:45:35.317
cmltik5bu000il104mv5w3i7v	cmltik5bu000gl104uskjis92	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-04-02 14:35:53.275	\N	f	SENT	\N	2026-02-19 13:45:31.387
cmltil01d000xl704pev7rrj6	cmltil01d000vl704ovuw66wd	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:46:11.185
cmltil1l60010l70499xpgnl7	cmltil1l6000yl7040hwi40gf	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:46:13.195
cmltikyoo000ol704iupnd0zh	cmltikyoo000ml704xsoplns7	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:46:09.433
cmltil33d0019l70450db21x1	cmltil33d0017l7047fulos5e	cmk3ydeww000cvnx8ql15tc69	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:46:15.145
cmnhl0ujd000k05hwq3b33svn	cmnhl0ujd000i05hw3abk3z9l	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	\N	\N	f	SENT	\N	2026-04-02 14:40:40.345
cmnhkxhte000505hw5ejwe49d	cmnhkxhte000305hw3cygw9bf	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	\N	\N	f	SENT	\N	2026-04-02 14:38:03.891
cmltil4je001cl704m0pvf2mk	cmltil4je001al7048m94i8ee	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-02-19 13:46:17.018
cmnhkxm4z000805hwju4od2bl	cmnhkxm4y000605hwldhxczy6	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-04-02 14:38:09.491
cmm0emqel000cvn88tfcalqcu	cmm0emqel000avn8855ji1xhw	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-02-24 09:29:56.782
cmltil33c0016l7049cof4sjf	cmltil33c0014l7041k945xbj	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:50.019	\N	f	SENT	\N	2026-02-19 13:46:15.144
cmm0emmp50009vn88ago2bojt	cmm0emmp50007vn88jyu4yive	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:50.019	\N	f	SENT	\N	2026-02-24 09:29:51.977
cmm3rp1pz000avn1k0r1qjej7	cmm3rp1pz0008vn1kua90nm4r	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-02-26 17:58:58.296
cmm3rowty0007vn1k3ad7o9e3	cmm3rowty0005vn1kjjyg8iqm	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:50.019	\N	f	SENT	\N	2026-02-26 17:58:51.958
cmm3rq18y000nvn1kmuufducf	cmm3rq18x000lvn1k7drk3mum	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:50.019	\N	f	SENT	\N	2026-02-26 17:59:44.337
cmm3rq4yk000tvn1k8ezw5nhu	cmm3rq4yk000rvn1kc8z0ue8m	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:50.019	\N	f	SENT	\N	2026-02-26 17:59:49.148
cmnhl0x0n000q05hwi9em07oj	cmnhl0x0n000o05hwlm197yut	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-04-02 14:40:43.56
cmnhl0unr000n05hwb4uk5p8z	cmnhl0unr000l05hw9ngyatxh	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:40:55.331	\N	f	SENT	\N	2026-04-02 14:40:40.503
cmnhkxhsy000205hw0fev58xt	cmnhkxhsy000005hwyii12j3s	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:38:53.062	\N	f	SENT	\N	2026-04-02 14:38:03.874
cmm3rq8zb000wvn1kfkd7hkll	cmm3rq8zb000uvn1kjnj23eq9	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-02-26 17:59:54.359
cmltijm2n000bl7046yt3os6r	cmltijm2n0009l7042xw4l7pr	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-04-02 14:35:53.275	\N	f	SENT	\N	2026-02-19 13:45:06.431
cmltijw4m000jl7047qbtln23	cmltijw4l000hl7048roj21dn	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-04-02 14:35:53.275	\N	f	SENT	\N	2026-02-19 13:45:19.462
cmltik40j000cl1043k31bbh2	cmltik40j000al1048k6pub5j	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-04-02 14:35:53.275	\N	f	SENT	\N	2026-02-19 13:45:29.683
cmltik6n1000ll104so8y54xa	cmltik6n0000jl104ad4wk41o	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-04-02 14:35:53.275	\N	f	SENT	\N	2026-02-19 13:45:33.085
cmltil33c0013l7047r0epcer	cmltil33b0011l704dwvrjta8	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-04-02 14:35:53.275	\N	f	SENT	\N	2026-02-19 13:46:15.144
cmm3rq4u4000qvn1kpmkvbcys	cmm3rq4u4000ovn1kok3blv1a	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	2026-04-02 14:35:53.275	\N	f	SENT	\N	2026-02-26 17:59:48.988
cmnhkztug000e05hwznvqlegj	cmnhkztug000c05hwi1kf4sb7	cmk3ydft9000ovnx8svln1xtu	{in_app,email}	2026-04-02 14:40:55.331	\N	f	SENT	\N	2026-04-02 14:39:52.793
cmnhkzsuo000b05hwo0rb1456	cmnhkzsuo000905hweoylo30q	cmk3ydex0000jvnx8bfxoe0g7	{in_app,email}	\N	\N	f	SENT	\N	2026-04-02 14:39:51.504
cmnhkzxit000h05hwcsh0s5l2	cmnhkzxit000f05hwe7qasjer	cmk3zhrg1000cvnoc5g7i6gmr	{in_app,email}	\N	\N	f	SENT	\N	2026-04-02 14:39:57.557
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_templates (id, key, title, body, "defaultChannels", "isActive", "createdAt", "updatedAt") FROM stdin;
cmk3ydtkc002uvnx8fnra3i8r	SETTINGS_CHANGE_APPROVED	Settings Change Approved	Your request to change {{changeType}} has been approved by {{reviewerName}}.	{in_app,email}	t	2026-01-07 11:46:47.149	2026-01-07 11:46:47.149
cmk3ydtkd002vvnx853myidy9	SETTINGS_CHANGE_REJECTED	Settings Change Rejected	Your request to change {{changeType}} has been rejected. Reason: {{reviewNotes}}	{in_app,email}	t	2026-01-07 11:46:47.149	2026-01-07 11:46:47.149
cmk3ydtkc002tvnx8xyu3mntb	SETTINGS_CHANGE_REQUESTED	Settings Change Request	{{employeeName}} has requested to change their {{changeType}} from '{{currentValue}}' to '{{requestedValue}}'. Reason: {{reason}}	{in_app,email}	t	2026-01-07 11:46:47.149	2026-01-07 11:46:47.149
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, "templateKey", title, body, data, category, "createdBy", "createdAt", "deliveredAt", status) FROM stdin;
cmk3zchrk0009vnocuxnatj39	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-001" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmk3zccsv0004vnockz5pp55t", "category": "assignment", "orderNumber": "202601-001", "assignmentId": "cmk3zcf7w0008vnocexg6xvc9", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-07 12:13:44.816	2026-01-07 12:13:50.723	SENT
cmk41eqar0005kz04soycxdtn	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-002" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmk41ent80000kz04k08vcq9m", "category": "assignment", "orderNumber": "202601-002", "assignmentId": "cmk41ep1b0004kz04nn1ldnam", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-07 13:11:28.42	2026-01-07 13:11:30.78	SENT
cmk41esbw0008kz04mzijhdga	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-002" wurde erstellt und für 1/15/2026 geplant.	{"orderId": "cmk41ent80000kz04k08vcq9m", "category": "order", "orderNumber": "202601-002", "scheduledDate": "1/15/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-07 13:11:31.052	2026-01-07 13:11:38.17	SENT
cmk89exa60003vnyc6xb4evz4	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-003" wurde erstellt und für 22/01/2026 geplant.	{"orderId": "cmk89estt0000vnyc7omj1l1g", "category": "order", "orderNumber": "202601-003", "scheduledDate": "22/01/2026"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-10 12:06:39.102	2026-01-10 12:06:44.889	SENT
cmk89f0qb0006vnyc1scxnz3y	ADMIN_CUSTOMER_ORDER_CREATED	Neuer Kundenauftrag	Global Marketing Corp von Global Marketing Corp hat einen neuen Auftrag "202601-003" erstellt.	{"orderId": "cmk89estt0000vnyc7omj1l1g", "category": "order", "customerId": "cmk3ydjet000yvnx895zjnz1q", "creatorName": "Global Marketing Corp", "orderNumber": "202601-003", "customerName": "Global Marketing Corp"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-10 12:06:43.571	2026-01-10 12:06:46.766	SENT
cmks9lqgq000bjm04e4hj1h9n	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-004" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmks9lo170006jm04wa05u0pf", "category": "assignment", "orderNumber": "202601-004", "assignmentId": "cmks9lp6q000ajm0475b7asah", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-24 12:07:20.378	2026-01-24 12:07:22.617	SENT
cmks9ls98000ejm044diipj1f	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-004" wurde erstellt und für 1/25/2026 geplant.	{"orderId": "cmks9lo170006jm04wa05u0pf", "category": "order", "orderNumber": "202601-004", "scheduledDate": "1/25/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-24 12:07:22.7	2026-01-24 12:07:43.972	SENT
cmkuy29tc0007jr04w8o9g2o2	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-005" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmkuy27pb0004jr04wgirjv21", "category": "assignment", "orderNumber": "202601-005", "assignmentId": "cmkuy28jt0006jr04f5opwibq", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-26 09:07:35.089	2026-01-26 09:07:37.334	SENT
cmkuy2ble000ajr04zja6fazp	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-005" wurde erstellt und für 1/21/2026 geplant.	{"orderId": "cmkuy27pb0004jr04wgirjv21", "category": "order", "orderNumber": "202601-005", "scheduledDate": "1/21/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-26 09:07:37.395	2026-01-26 09:08:18.852	SENT
cmkxhmn0e0005vn1cpy05o85a	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-006" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmkxhmhpx0000vn1c194ch3dq", "category": "assignment", "orderNumber": "202601-006", "assignmentId": "cmkxhmk8u0004vn1ckmcdpjwm", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 03:50:50.367	2026-01-28 03:50:56.841	SENT
cmkxhmrs70008vn1czamm7fr4	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-006" wurde erstellt und für 29/01/2026 geplant.	{"orderId": "cmkxhmhpx0000vn1c194ch3dq", "category": "order", "orderNumber": "202601-006", "scheduledDate": "29/01/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 03:50:56.551	2026-01-28 03:51:01.184	SENT
cmkxuu2wx0004vnb4e0lg3cuo	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-006" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cmkxhmhpx0000vn1c194ch3dq", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202601-006"}	order	\N	2026-01-28 10:00:32.577	2026-01-28 10:00:38.375	SENT
cmkxuu6kf0007vnb49bxuypbx	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202601-006" begonnen.	{"orderId": "cmkxhmhpx0000vn1c194ch3dq", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-006", "employeeName": "Mike Developer"}	order	\N	2026-01-28 10:00:37.311	2026-01-28 10:00:40.144	SENT
cmkxuu963000avnb4db5trbce	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-006" ist in Bearbeitung.	{"orderId": "cmkxhmhpx0000vn1c194ch3dq", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-006"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 10:00:40.684	2026-01-28 10:00:43.01	SENT
cmkxuu9cm000dvnb4odiufl76	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-006" ist in Bearbeitung.	{"orderId": "cmkxhmhpx0000vn1c194ch3dq", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-006"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 10:00:40.918	2026-01-28 10:00:45.121	SENT
cmkxuudn1000gvnb47xam5he6	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-006" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cmkxhmhpx0000vn1c194ch3dq", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-006"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 10:00:46.478	2026-01-28 10:00:49.322	SENT
cmkxvkzip0003vni0e894pf07	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-006" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmkxvkv380000vni00wn6gg5q", "category": "assignment", "orderNumber": "202601-006", "assignmentId": "cmkxvkws50002vni0hbmhrmhy", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 10:21:27.889	2026-01-28 10:21:33.907	SENT
cmkxvl3xe0006vni0t7xf7f0d	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-006" wurde erstellt und für 23/01/2026 geplant.	{"orderId": "cmkxvkv380000vni00wn6gg5q", "category": "order", "orderNumber": "202601-006", "scheduledDate": "23/01/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 10:21:33.602	2026-01-28 10:21:37.83	SENT
cmkxz9hp60008vn0wycn5jgk6	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-006" wurde erstellt und für 31/01/2026 geplant.	{"orderId": "cmkxz982h0000vn0wmzx6td9e", "category": "order", "orderNumber": "202601-006", "scheduledDate": "31/01/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 12:04:30.043	\N	PENDING
cmkxz9dlu0005vn0wp62cb90o	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-006" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmkxz982h0000vn0wmzx6td9e", "category": "assignment", "orderNumber": "202601-006", "assignmentId": "cmkxz9aj30004vn0wf7swgrae", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 12:04:24.738	2026-01-28 12:04:30.34	SENT
cmky0g1hm0005vn846l6ja32v	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-006" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmky0fwkl0000vn84sl2ul7cy", "category": "assignment", "orderNumber": "202601-006", "assignmentId": "cmky0fyx50004vn84of1mwxj9", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 12:37:35.243	2026-01-28 12:37:41.497	SENT
cmky0g5io0008vn84ljcbl00t	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-006" wurde erstellt und für 31/01/2026 geplant.	{"orderId": "cmky0fwkl0000vn84sl2ul7cy", "category": "order", "orderNumber": "202601-006", "scheduledDate": "31/01/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 12:37:40.465	2026-01-28 12:37:43.817	SENT
cmky0s0v40005vnxs0u3ya8bb	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-007" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmky0rvdz0000vnxsqhelrn25", "category": "assignment", "orderNumber": "202601-007", "assignmentId": "cmky0ry1c0004vnxspl4ghg47", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 12:46:54.304	2026-01-28 12:47:00.053	SENT
cmky0s4zk0008vnxsp2ndo03d	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-007" wurde erstellt und für 31/01/2026 geplant.	{"orderId": "cmky0rvdz0000vnxsqhelrn25", "category": "order", "orderNumber": "202601-007", "scheduledDate": "31/01/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 12:46:59.648	2026-01-28 12:47:02.235	SENT
cmky1jcrf0007vnf06b9qpz5k	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-008" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmky1j6u90000vnf02srf9kb2", "category": "assignment", "orderNumber": "202601-008", "assignmentId": "cmky1j9vu0006vnf0pkeomv5b", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 13:08:09.436	2026-01-28 13:08:15.167	SENT
cmky1jgu4000avnf0xelceti2	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-008" wurde erstellt und für 31/01/2026 geplant.	{"orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "orderNumber": "202601-008", "scheduledDate": "31/01/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 13:08:14.716	2026-01-28 13:08:16.982	SENT
cmky1kxoc000hvnf08eiynix6	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-008" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202601-008"}	order	\N	2026-01-28 13:09:23.197	2026-01-28 13:09:26.843	SENT
cmky1l00o000kvnf06m52y88k	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202601-008" begonnen.	{"orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-008", "employeeName": "Mike Developer"}	order	\N	2026-01-28 13:09:26.233	2026-01-28 13:09:28.802	SENT
cmky1l2w0000qvnf0lvlj7wkv	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Bearbeitung.	{"orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:09:29.952	2026-01-28 13:09:33.313	SENT
cmky1l2vy000nvnf0w2qeogva	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Bearbeitung.	{"orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:09:29.951	2026-01-28 13:09:34.888	SENT
cmky1l5d3000tvnf0xdymx7q8	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-008" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:09:33.16	2026-01-28 13:09:36.48	SENT
cmky1lhks000yvnf02yaj4pjl	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-008" hinzugefügt: Order submitted for review	{"action": "openNotes", "orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "notePreview": "Order submitted for review", "orderNumber": "202601-008"}	order	\N	2026-01-28 13:09:48.988	2026-01-28 13:09:53.279	SENT
cmky1ljth0011vnf0gfhadgbm	ORDER_REVIEW_REQUESTED	Auftragsabschluss-Überprüfung angefordert	Mike Developer hat Auftrag "202601-008" abgeschlossen und bittet um Ihre Überprüfung für die finale Genehmigung.	{"orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-008", "employeeName": "Mike Developer"}	order	\N	2026-01-28 13:09:51.894	2026-01-28 13:09:55.334	SENT
cmky1lmq90017vnf0qw9e76t7	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Überprüfung.	{"orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:09:55.665	2026-01-28 13:09:58.028	SENT
cmky1lmq80014vnf0khts0xi9	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Überprüfung.	{"orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:09:55.664	2026-01-28 13:09:59.593	SENT
cmky1lpcm001avnf0936rpkrv	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-008" wurde auf ist in Überprüfung aktualisiert.	{"status": "ist in Überprüfung", "orderId": "cmky1j6u90000vnf02srf9kb2", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:09:59.062	2026-01-28 13:10:01.314	SENT
cmky2aqlv0007vno8i30ilcgr	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-008" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "assignment", "orderNumber": "202601-008", "assignmentId": "cmky2ao0h0006vno8ftdplr17", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 13:29:27.091	2026-01-28 13:29:32.494	SENT
cmky2avn5000avno842z7dggf	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-008" wurde erstellt und für 31/01/2026 geplant.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "orderNumber": "202601-008", "scheduledDate": "31/01/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 13:29:33.617	2026-01-28 13:29:36.499	SENT
cmky2cdyh000hvno8pinbz9r4	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-008" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202601-008"}	order	\N	2026-01-28 13:30:44.01	2026-01-28 13:30:47.723	SENT
cmky2cg1s000kvno8b0wtk6of	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202601-008" begonnen.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-008", "employeeName": "Mike Developer"}	order	\N	2026-01-28 13:30:46.72	2026-01-28 13:30:49.887	SENT
cmky2cj4p000nvno8gm6bwmb7	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Bearbeitung.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:30:50.713	2026-01-28 13:30:54.992	SENT
cmky2cmra000tvno809z8veyv	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-008" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:30:55.415	2026-01-28 13:30:57.814	SENT
cmky2eob3000yvno8min76kkj	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-008" hinzugefügt: Work completed. Reported quantities: 345 cartons, ...	{"action": "openNotes", "orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "notePreview": "Work completed. Reported quantities: 345 cartons, ...", "orderNumber": "202601-008"}	order	\N	2026-01-28 13:32:30.735	2026-01-28 13:32:33.622	SENT
cmky2eqda0011vno8h18gy33w	ORDER_REVIEW_REQUESTED	Auftragsabschluss-Überprüfung angefordert	Mike Developer hat Auftrag "202601-008" abgeschlossen und bittet um Ihre Überprüfung für die finale Genehmigung.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-008", "employeeName": "Mike Developer"}	order	\N	2026-01-28 13:32:33.407	2026-01-28 13:32:36.001	SENT
cmky2eswk0014vno8mdyj7szz	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Überprüfung.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:32:36.692	2026-01-28 13:32:39.054	SENT
cmky2evdh001avno81hg9xtzx	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-008" wurde auf ist in Überprüfung aktualisiert.	{"status": "ist in Überprüfung", "orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:32:39.893	2026-01-28 13:32:42.333	SENT
cmky2goiq001fvno8772z8hp5	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-008" hinzugefügt: approved	{"action": "openNotes", "orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "notePreview": "approved", "orderNumber": "202601-008"}	order	\N	2026-01-28 13:34:04.322	2026-01-28 13:34:07.972	SENT
cmky2gr3c001ivno8x7q0miow	ORDER_APPROVED	Auftrag genehmigt	Auftrag "202601-008" wurde genehmigt und abgeschlossen.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 13:34:07.656	2026-01-28 13:34:10.331	SENT
cmky2gths001lvno8drdsliz8	CUSTOMER_ORDER_COMPLETED	Auftrag abgeschlossen	Ihr Auftrag "202601-008" wurde erfolgreich abgeschlossen.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 13:34:10.768	2026-01-28 13:34:13.158	SENT
cmky2gwkt001rvno8v5gdt09r	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" wurde abgeschlossen.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 13:34:14.766	2026-01-28 13:34:19.89	SENT
cmky2gyvj001uvno883k3qe0v	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-008" wurde auf wurde abgeschlossen aktualisiert.	{"status": "wurde abgeschlossen", "orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 13:34:17.744	2026-01-28 13:34:21.476	SENT
cmky2cj4t000qvno877waq8p2	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Bearbeitung.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:30:50.717	2026-01-28 13:30:53.416	SENT
cmky2eswx0017vno8xiha3bof	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Überprüfung.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-28 13:32:36.705	2026-01-28 13:32:40.682	SENT
cmky2gwko001ovno82sdxxqjj	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" wurde abgeschlossen.	{"orderId": "cmky2al020000vno8u1qd4iyp", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-28 13:34:14.76	2026-01-28 13:34:18.3	SENT
cmky3f03s0020vno8kd5octau	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-009" wurde erstellt und für 31/01/2026 geplant.	{"orderId": "cmky3ev9y001xvno8vse123tu", "category": "order", "orderNumber": "202601-009", "scheduledDate": "31/01/2026"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-28 14:00:45.64	2026-01-28 14:00:50.111	SENT
cmky3f2mt0023vno8106q09a0	ADMIN_CUSTOMER_ORDER_CREATED	Neuer Kundenauftrag	Global Marketing Corp von Global Marketing Corp hat einen neuen Auftrag "202601-009" erstellt.	{"orderId": "cmky3ev9y001xvno8vse123tu", "category": "order", "customerId": "cmk3ydjet000yvnx895zjnz1q", "creatorName": "Global Marketing Corp", "orderNumber": "202601-009", "customerName": "Global Marketing Corp"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-28 14:00:48.917	2026-01-28 14:00:52.08	SENT
cml0qzkme000fvnc88jxw4of2	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-007" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cml0qzfer0008vnc8pbw6jpa5", "category": "assignment", "orderNumber": "202601-007", "assignmentId": "cml0qzhym000evnc8f2u9x8lc", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 10:36:08.87	2026-01-30 10:36:14.601	SENT
cml0qzoof000ivnc8ghp6as84	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-007" wurde erstellt und für 31/01/2026 geplant.	{"orderId": "cml0qzfer0008vnc8pbw6jpa5", "category": "order", "orderNumber": "202601-007", "scheduledDate": "31/01/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 10:36:14.128	2026-01-30 10:36:16.696	SENT
cml0r8kdg000pvnc85rr39kkv	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-007" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cml0qzfer0008vnc8pbw6jpa5", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202601-007"}	order	\N	2026-01-30 10:43:08.453	2026-01-30 10:43:12.543	SENT
cml0r8mqm000svnc8nyvmxr7d	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202601-007" begonnen.	{"orderId": "cml0qzfer0008vnc8pbw6jpa5", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-007", "employeeName": "Mike Developer"}	order	\N	2026-01-30 10:43:11.518	2026-01-30 10:43:14.716	SENT
cml0r8px0000vvnc8eztyrns1	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-007" ist in Bearbeitung.	{"orderId": "cml0qzfer0008vnc8pbw6jpa5", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-007"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-30 10:43:15.637	2026-01-30 10:43:18.559	SENT
cml0r8pxf000yvnc8the12hxs	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-007" ist in Bearbeitung.	{"orderId": "cml0qzfer0008vnc8pbw6jpa5", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-007"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-30 10:43:15.651	2026-01-30 10:43:21.536	SENT
cml0r8ter0011vnc8tyah41k5	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-007" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cml0qzfer0008vnc8pbw6jpa5", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-007"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-30 10:43:20.163	2026-01-30 10:43:23.81	SENT
cml0xnc8q000dla04bmuigwdz	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-008" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "assignment", "orderNumber": "202601-008", "assignmentId": "cml0xnaxi000cla04icawlmts", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 13:42:35.45	2026-01-30 13:42:37.745	SENT
cml0xne0c000gla04muu0pry7	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-008" wurde erstellt und für 1/30/2026 geplant.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "orderNumber": "202601-008", "scheduledDate": "1/30/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 13:42:37.741	2026-01-30 13:42:50.952	SENT
cml0xovxy000nla044k4sucks	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-008" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202601-008"}	order	\N	2026-01-30 13:43:47.638	2026-01-30 13:43:49.032	SENT
cml0xowxj000qla04iqc31ia0	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202601-008" begonnen.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-008", "employeeName": "Mike Developer"}	order	\N	2026-01-30 13:43:48.919	2026-01-30 13:43:49.98	SENT
cml0xoya3000tla04rt556gf7	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Bearbeitung.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-30 13:43:50.667	2026-01-30 13:43:51.727	SENT
cml0xoyc6000wla04qihav4t4	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Bearbeitung.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-30 13:43:50.742	2026-01-30 13:43:52.435	SENT
cml0xozyx000zla04wso8mytn	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-008" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-30 13:43:52.858	2026-01-30 13:43:54.724	SENT
cml0xpwfb0014la04o92f6uuq	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-008" hinzugefügt: Work completed. Reported quantities: 477 cartons, ...	{"action": "openNotes", "orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "notePreview": "Work completed. Reported quantities: 477 cartons, ...", "orderNumber": "202601-008"}	order	\N	2026-01-30 13:44:34.919	2026-01-30 13:44:36.224	SENT
cml0xpyzz001dla04x2nld5of	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Überprüfung.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-30 13:44:38.256	2026-01-30 13:44:40.053	SENT
cml0xpxnf0017la04plm5aizr	ORDER_REVIEW_REQUESTED	Auftragsabschluss-Überprüfung angefordert	Mike Developer hat Auftrag "202601-008" abgeschlossen und bittet um Ihre Überprüfung für die finale Genehmigung.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-008", "employeeName": "Mike Developer"}	order	\N	2026-01-30 13:44:36.507	2026-01-30 13:44:37.512	SENT
cml0xpyzz001ala043m8h3a35	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" ist in Überprüfung.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-30 13:44:38.255	2026-01-30 13:44:39.279	SENT
cml0xq083001gla04b3lsgtvc	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-008" wurde auf ist in Überprüfung aktualisiert.	{"status": "ist in Überprüfung", "orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-008"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-30 13:44:39.843	2026-01-30 13:44:41.788	SENT
cml0xr9yx001ula04fuq36pyx	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" wurde abgeschlossen.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 13:45:39.13	2026-01-30 13:45:40.116	SENT
cml0xr6yk001lla04cbi65s9f	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-008" hinzugefügt: Completed	{"action": "openNotes", "orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "notePreview": "Completed", "orderNumber": "202601-008"}	order	\N	2026-01-30 13:45:35.228	2026-01-30 13:45:36.261	SENT
cml0xr7vq001ola04yoo2a0bc	ORDER_APPROVED	Auftrag genehmigt	Auftrag "202601-008" wurde genehmigt und abgeschlossen.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 13:45:36.422	2026-01-30 13:45:37.388	SENT
cml0xr8sy001rla04tazjo5j7	CUSTOMER_ORDER_COMPLETED	Auftrag abgeschlossen	Ihr Auftrag "202601-008" wurde erfolgreich abgeschlossen.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 13:45:37.619	2026-01-30 13:45:38.585	SENT
cml0xrb2q0020la048szqd9vx	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-008" wurde auf wurde abgeschlossen aktualisiert.	{"status": "wurde abgeschlossen", "orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 13:45:40.562	\N	PENDING
cml0xr9yy001xla04bwoswn23	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-008" wurde abgeschlossen.	{"orderId": "cml0xn9pi0006la041r776yzj", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202601-008"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 13:45:39.131	2026-01-30 13:45:40.8	SENT
cml0xt2pu0007jq048avluerm	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-009" wurde erstellt und für 1/30/2026 geplant.	{"orderId": "cml0xt0dm0002jq04avfyn7et", "category": "order", "orderNumber": "202601-009", "scheduledDate": "1/30/2026"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-30 13:47:03.042	2026-01-30 13:47:05.199	SENT
cml0xt48s000ajq04800tvyhr	ADMIN_CUSTOMER_ORDER_CREATED	Neuer Kundenauftrag	Global Marketing Corp von Global Marketing Corp hat einen neuen Auftrag "202601-009" erstellt.	{"orderId": "cml0xt0dm0002jq04avfyn7et", "category": "order", "customerId": "cmk3ydjet000yvnx895zjnz1q", "creatorName": "Global Marketing Corp", "orderNumber": "202601-009", "customerName": "Global Marketing Corp"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-30 13:47:05.02	2026-01-30 13:47:07.241	SENT
cml0xvhqa000fjq04io1moqih	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-009" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cml0xt0dm0002jq04avfyn7et", "category": "assignment", "orderNumber": "202601-009", "assignmentId": "cml0xvgg1000ejq04lsz51p68", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-30 13:48:55.81	2026-01-30 13:48:58.055	SENT
cml14hlhb0005jo04v2yetb28	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-009" wurde erstellt und für 1/30/2026 geplant.	{"orderId": "cml14hj530000jo049yzdm7j6", "category": "order", "orderNumber": "202601-009", "scheduledDate": "1/30/2026"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-30 16:54:04.799	2026-01-30 16:54:06.921	SENT
cml14hmz40008jo04fj48r8ax	ADMIN_CUSTOMER_ORDER_CREATED	Neuer Kundenauftrag	Global Marketing Corp von Global Marketing Corp hat einen neuen Auftrag "202601-009" erstellt.	{"orderId": "cml14hj530000jo049yzdm7j6", "category": "order", "customerId": "cmk3ydjet000yvnx895zjnz1q", "creatorName": "Global Marketing Corp", "orderNumber": "202601-009", "customerName": "Global Marketing Corp"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-30 16:54:06.736	2026-01-30 16:54:07.937	SENT
cml2hx76o0007jj04c7ih729d	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-007" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "assignment", "orderNumber": "202601-007", "assignmentId": "cml2hx5wr0006jj04h3lukta4", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-31 15:57:53.952	2026-01-31 15:57:56.262	SENT
cml2hx99a000ajj04r8iuo68o	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-007" wurde erstellt und für 1/31/2026 geplant.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "orderNumber": "202601-007", "scheduledDate": "1/31/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-31 15:57:56.639	2026-01-31 15:58:18.216	FAILED
cml2hykjl000cl704depfsmej	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-007" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202601-007"}	order	\N	2026-01-31 15:58:57.921	2026-01-31 15:59:00.503	SENT
cml2hym1g000fl7043ndgbcyg	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202601-007" begonnen.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-007", "employeeName": "Mike Developer"}	order	\N	2026-01-31 15:58:59.86	2026-01-31 15:59:01.349	SENT
cml2hynd1000il704izal3666	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-007" ist in Bearbeitung.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-007"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-31 15:59:01.574	2026-01-31 15:59:02.79	SENT
cml2hynf9000ll70400espgt6	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-007" ist in Bearbeitung.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-007"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-31 15:59:01.654	2026-01-31 15:59:03.713	SENT
cml2hyot3000ol704g3qa2bid	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-007" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202601-007"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-31 15:59:03.447	2026-01-31 15:59:05.34	SENT
cml2hzk5n000tl704csg0wo8g	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-007" hinzugefügt: Work completed. Reported quantities: 15 cartons, 3...	{"action": "openNotes", "orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "notePreview": "Work completed. Reported quantities: 15 cartons, 3...", "orderNumber": "202601-007"}	order	\N	2026-01-31 15:59:44.075	2026-01-31 15:59:45.083	SENT
cml2hzl00000wl704f3f2lm2y	ORDER_REVIEW_REQUESTED	Auftragsabschluss-Überprüfung angefordert	Mike Developer hat Auftrag "202601-007" abgeschlossen und bittet um Ihre Überprüfung für die finale Genehmigung.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202601-007", "employeeName": "Mike Developer"}	order	\N	2026-01-31 15:59:45.168	2026-01-31 15:59:46.17	SENT
cml2hzm55000zl704x3fpcd74	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-007" ist in Überprüfung.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-007"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-31 15:59:46.649	2026-01-31 15:59:47.79	SENT
cml2hzm580012l7042yewfhb2	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-007" ist in Überprüfung.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-007"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-31 15:59:46.652	2026-01-31 15:59:48.548	SENT
cml2hznlw0015l704nkrqw7ri	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-007" wurde auf ist in Überprüfung aktualisiert.	{"status": "ist in Überprüfung", "orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202601-007"}	order	cmk3ydft9000ovnx8svln1xtu	2026-01-31 15:59:48.549	2026-01-31 15:59:49.894	SENT
cml2i0mlp000rjj041c5igmvd	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-007" wurde abgeschlossen.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202601-007"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-31 16:00:33.902	2026-01-31 16:00:35.76	SENT
cml2i0o8u000ujj04lxd5kg28	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202601-007" wurde auf wurde abgeschlossen aktualisiert.	{"status": "wurde abgeschlossen", "orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202601-007"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-31 16:00:36.03	2026-01-31 16:00:38.071	SENT
cml2i4hum000zjj04cm8zqnol	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202601-008" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cml2i2j9r0018l704p66lmkfp", "category": "assignment", "orderNumber": "202601-008", "assignmentId": "cml2i4gye000yjj04molifl82", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-01-31 16:03:34.366	2026-01-31 16:03:36.081	SENT
cml2i0ixx000fjj0408ao1iar	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202601-007" hinzugefügt: completed	{"action": "openNotes", "orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "notePreview": "completed", "orderNumber": "202601-007"}	order	\N	2026-01-31 16:00:29.158	2026-01-31 16:00:30.544	SENT
cml2i0k3l000ijj04idhrbtb7	ORDER_APPROVED	Auftrag genehmigt	Auftrag "202601-007" wurde genehmigt und abgeschlossen.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "orderNumber": "202601-007"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-31 16:00:30.658	2026-01-31 16:00:31.752	SENT
cml2i0l7b000ljj04x21s238o	CUSTOMER_ORDER_COMPLETED	Auftrag abgeschlossen	Ihr Auftrag "202601-007" wurde erfolgreich abgeschlossen.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "orderNumber": "202601-007"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-31 16:00:32.088	2026-01-31 16:00:33.363	SENT
cml2i0mjl000ojj04qoqi56zo	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202601-007" wurde abgeschlossen.	{"orderId": "cml2hx4mi0000jj04e9bu48ai", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202601-007"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-01-31 16:00:33.826	2026-01-31 16:00:34.951	SENT
cml2i2lmf001dl704h7hwtwoe	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202601-008" wurde erstellt und für 1/31/2026 geplant.	{"orderId": "cml2i2j9r0018l704p66lmkfp", "category": "order", "orderNumber": "202601-008", "scheduledDate": "1/31/2026"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-31 16:02:05.943	2026-01-31 16:02:07.55	SENT
cml2i2ms3001gl704q34dfmby	ADMIN_CUSTOMER_ORDER_CREATED	Neuer Kundenauftrag	Global Marketing Corp von Global Marketing Corp hat einen neuen Auftrag "202601-008" erstellt.	{"orderId": "cml2i2j9r0018l704p66lmkfp", "category": "order", "customerId": "cmk3ydjet000yvnx895zjnz1q", "creatorName": "Global Marketing Corp", "orderNumber": "202601-008", "customerName": "Global Marketing Corp"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-01-31 16:02:07.443	2026-01-31 16:02:09.618	SENT
cmlp7t1qk000dl704k6r21y58	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202602-001" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmlp7syix0000l7041aca1ck7", "category": "assignment", "orderNumber": "202602-001", "assignmentId": "cmlp7t0h1000cl704fxvm7ztc", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-02-16 13:33:26.157	2026-02-16 13:33:28.407	SENT
cmlp7t3rh000gl704kh2knm0s	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202602-001" wurde erstellt und für 2/26/2026 geplant.	{"orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "orderNumber": "202602-001", "scheduledDate": "2/26/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-16 13:33:28.782	2026-02-16 13:33:37.988	SENT
cmlpc3g420004l104l221ryxu	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-001" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202602-001"}	order	\N	2026-02-16 15:33:29.811	2026-02-16 15:33:31.915	SENT
cmlpc3hlu0007l1043x9flkiy	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202602-001" begonnen.	{"orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202602-001", "employeeName": "Mike Developer"}	order	\N	2026-02-16 15:33:31.746	2026-02-16 15:33:32.729	SENT
cmlpc3ixt000al104un212bif	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" ist in Bearbeitung.	{"orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-16 15:33:33.473	2026-02-16 15:33:34.684	SENT
cmlpc3izz000dl104hkg2xpsx	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" ist in Bearbeitung.	{"orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-16 15:33:33.551	2026-02-16 15:33:35.411	SENT
cmlpc3kmm000gl1047wme7o0s	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-001" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-16 15:33:35.662	2026-02-16 15:33:37.342	SENT
cmlpc86mp000ll1041cfok5mr	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-001" hinzugefügt: Work completed. Reported quantities: 60 cartons, 1...	{"action": "openNotes", "orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "notePreview": "Work completed. Reported quantities: 60 cartons, 1...", "orderNumber": "202602-001"}	order	\N	2026-02-16 15:37:10.802	2026-02-16 15:37:12.394	SENT
cmlpc87u1000ol10454iojr9l	ORDER_REVIEW_REQUESTED	Auftragsabschluss-Überprüfung angefordert	Mike Developer hat Auftrag "202602-001" abgeschlossen und bittet um Ihre Überprüfung für die finale Genehmigung.	{"orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202602-001", "employeeName": "Mike Developer"}	order	\N	2026-02-16 15:37:12.362	2026-02-16 15:37:13.302	SENT
cmlpc895i000rl104d24q77ur	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" ist in Überprüfung.	{"orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-16 15:37:14.071	2026-02-16 15:37:15.276	SENT
cmlpc897n000ul104464eudel	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" ist in Überprüfung.	{"orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-16 15:37:14.147	2026-02-16 15:37:16.018	SENT
cmlpc8ath000xl104iid5y2yz	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-001" wurde auf ist in Überprüfung aktualisiert.	{"status": "ist in Überprüfung", "orderId": "cmlp7syix0000l7041aca1ck7", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-16 15:37:16.229	2026-02-16 15:37:18.212	SENT
cmlq6w25n000bvn7on9u5oyvd	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202602-001" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "assignment", "orderNumber": "202602-001", "assignmentId": "cmlq6vzna000avn7o536znx6d", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 05:55:33.227	2026-02-17 05:55:40.011	SENT
cmlq6w5y6000evn7obslo6pp2	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202602-001" wurde erstellt und für 28/02/2026 geplant.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "orderNumber": "202602-001", "scheduledDate": "28/02/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 05:55:38.142	2026-02-17 05:55:42.011	SENT
cmlq6xljm000nvn7ogz5idoff	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-001" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202602-001"}	order	\N	2026-02-17 05:56:45.01	2026-02-17 05:56:49.183	SENT
cmlq6xoan000qvn7oyptpw3lz	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202602-001" begonnen.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202602-001", "employeeName": "Mike Developer"}	order	\N	2026-02-17 05:56:48.575	2026-02-17 05:56:51.737	SENT
cmlq6xrsq000tvn7ou8qqq6p2	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" ist in Bearbeitung.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 05:56:53.114	2026-02-17 05:56:55.633	SENT
cmlq6xs10000wvn7oqwhbo6s3	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" ist in Bearbeitung.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 05:56:53.413	2026-02-17 05:56:57.183	SENT
cmlq6xuoj000zvn7och8yg7zn	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-001" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 05:56:56.851	2026-02-17 05:56:59.04	SENT
cmlq6z07p0014vn7owcf3ooku	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-001" hinzugefügt: Work completed on container CONT-1771307693558. Re...	{"action": "openNotes", "orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "notePreview": "Work completed on container CONT-1771307693558. Re...", "orderNumber": "202602-001"}	order	\N	2026-02-17 05:57:50.677	2026-02-17 05:57:54.609	SENT
cmlq708ur001bvn7o70o13cki	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-001" hinzugefügt: Work completed on container CONT-1771307694846. Re...	{"action": "openNotes", "orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "notePreview": "Work completed on container CONT-1771307694846. Re...", "orderNumber": "202602-001"}	order	\N	2026-02-17 05:58:48.531	2026-02-17 05:58:51.332	SENT
cmlq70pta001ivn7o18cpkb73	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-001" hinzugefügt: Work completed on container CONT-1771307695314. Re...	{"action": "openNotes", "orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "notePreview": "Work completed on container CONT-1771307695314. Re...", "orderNumber": "202602-001"}	order	\N	2026-02-17 05:59:10.511	2026-02-17 05:59:14.086	SENT
cmlq76p00001nvn7ocau3vevk	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-001" hinzugefügt: All containers completed. Requesting review.	{"action": "openNotes", "orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "notePreview": "All containers completed. Requesting review.", "orderNumber": "202602-001"}	order	\N	2026-02-17 06:03:49.393	2026-02-17 06:03:53.909	SENT
cmlq76red001qvn7o9ssz1tiy	ORDER_REVIEW_REQUESTED	Auftragsabschluss-Überprüfung angefordert	Mike Developer hat Auftrag "202602-001" abgeschlossen und bittet um Ihre Überprüfung für die finale Genehmigung.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202602-001", "employeeName": "Mike Developer"}	order	\N	2026-02-17 06:03:52.501	2026-02-17 06:03:56.363	SENT
cmlq76u1n001tvn7ougjweimc	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" ist in Überprüfung.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 06:03:55.931	2026-02-17 06:03:58.677	SENT
cmlq76u6x001wvn7o1qhqxcim	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" ist in Überprüfung.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 06:03:56.121	2026-02-17 06:04:00.115	SENT
cmlq76xoe001zvn7oxow5793g	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-001" wurde auf ist in Überprüfung aktualisiert.	{"status": "ist in Überprüfung", "orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-001"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 06:04:00.638	2026-02-17 06:04:02.719	SENT
cmlq7l0xv0024vn7os3h43mqa	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-001" hinzugefügt: Order approved and marked as completed.	{"action": "openNotes", "orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "notePreview": "Order approved and marked as completed.", "orderNumber": "202602-001"}	order	\N	2026-02-17 06:14:58.052	2026-02-17 06:15:04.32	SENT
cmlq7l3wu0027vn7ogvcq73f9	ORDER_APPROVED	Auftrag genehmigt	Auftrag "202602-001" wurde genehmigt und abgeschlossen.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "orderNumber": "202602-001"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 06:15:01.902	2026-02-17 06:15:07.111	SENT
cmlq7l6q2002avn7o873igqgo	CUSTOMER_ORDER_COMPLETED	Auftrag abgeschlossen	Ihr Auftrag "202602-001" wurde erfolgreich abgeschlossen.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "orderNumber": "202602-001"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 06:15:05.547	2026-02-17 06:15:09.735	SENT
cmlq7lazd002dvn7o0z2mldt2	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" wurde abgeschlossen.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-001"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 06:15:11.065	2026-02-17 06:15:15.901	SENT
cmlq7lb5b002gvn7ofykvvkfq	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-001" wurde abgeschlossen.	{"orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-001"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 06:15:11.279	2026-02-17 06:15:19.951	SENT
cmlq7lfmd002jvn7oln9pao90	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-001" wurde auf wurde abgeschlossen aktualisiert.	{"status": "wurde abgeschlossen", "orderId": "cmlq6vwvj0000vn7olwz1gidq", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-001"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 06:15:17.078	2026-02-17 06:15:24.304	SENT
cmlqjj2jv000bkw04ff44hv3l	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202602-002" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "assignment", "orderNumber": "202602-002", "assignmentId": "cmlqjj1b4000akw04p6j6bul5", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 11:49:22.22	2026-02-17 11:49:24.424	SENT
cmlqjj4b5000ekw04c6qkv8nj	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202602-002" wurde erstellt und für 3/3/2026 geplant.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "orderNumber": "202602-002", "scheduledDate": "3/3/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 11:49:24.497	2026-02-17 11:49:29.732	SENT
cmlqjkvqq000nkw04jzf8px1w	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-002" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202602-002"}	order	\N	2026-02-17 11:50:46.706	2026-02-17 11:50:48.192	SENT
cmlqjkwyp000qkw04jqb04asp	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202602-002" begonnen.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202602-002", "employeeName": "Mike Developer"}	order	\N	2026-02-17 11:50:48.29	2026-02-17 11:50:49.289	SENT
cmlqjkyam000tkw04qw762e13	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" ist in Bearbeitung.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-002"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 11:50:50.015	2026-02-17 11:50:51.027	SENT
cmlqjkyan000wkw04qhacwbj4	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" ist in Bearbeitung.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-002"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 11:50:50.015	2026-02-17 11:50:51.666	SENT
cmlqjkzi1000zkw04ly0bnwq9	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-002" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-002"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 11:50:51.578	2026-02-17 11:50:53.77	SENT
cmlqjlf850002l704f0bn24wj	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-002" hinzugefügt: Work completed on container CONT-1771328891978. Re...	{"action": "openNotes", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "notePreview": "Work completed on container CONT-1771328891978. Re...", "orderNumber": "202602-002"}	order	\N	2026-02-17 11:51:11.957	2026-02-17 11:51:14.874	SENT
cmlqjmqh50007l704dzr194ky	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-002" hinzugefügt: Work completed on container CONT-1771328892950. Re...	{"action": "openNotes", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "notePreview": "Work completed on container CONT-1771328892950. Re...", "orderNumber": "202602-002"}	order	\N	2026-02-17 11:52:13.194	2026-02-17 11:52:17.93	SENT
cmlqjn9o90016kw04ld95i6sf	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-002" hinzugefügt: Work completed on container CONT-1771328893404. Re...	{"action": "openNotes", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "notePreview": "Work completed on container CONT-1771328893404. Re...", "orderNumber": "202602-002"}	order	\N	2026-02-17 11:52:38.074	2026-02-17 11:52:40.198	SENT
cmlqjnhpf000el704av0pcf5g	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-002" hinzugefügt: All containers completed. Requesting review.	{"action": "openNotes", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "notePreview": "All containers completed. Requesting review.", "orderNumber": "202602-002"}	order	\N	2026-02-17 11:52:48.484	2026-02-17 11:52:49.799	SENT
cmlqjnix8000hl7040obw9qkp	ORDER_REVIEW_REQUESTED	Auftragsabschluss-Überprüfung angefordert	Mike Developer hat Auftrag "202602-002" abgeschlossen und bittet um Ihre Überprüfung für die finale Genehmigung.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202602-002", "employeeName": "Mike Developer"}	order	\N	2026-02-17 11:52:50.06	2026-02-17 11:52:51.048	SENT
cmlqjnk90000nl7045l6t0a5s	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" ist in Überprüfung.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-002"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 11:52:51.781	2026-02-17 11:52:53.001	SENT
cmlqjnk8z000kl704hoi8g9ec	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" ist in Überprüfung.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-002"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 11:52:51.779	2026-02-17 11:52:53.722	SENT
cmlqjnlj2000ql7047kgkw1zc	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-002" wurde auf ist in Überprüfung aktualisiert.	{"status": "ist in Überprüfung", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-002"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 11:52:53.438	2026-02-17 11:52:54.756	SENT
cmlqjop19000vl7049f7sdsps	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-002" hinzugefügt: Order approved and marked as completed.	{"action": "openNotes", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "notePreview": "Order approved and marked as completed.", "orderNumber": "202602-002"}	order	\N	2026-02-17 11:53:44.638	2026-02-17 11:53:45.933	SENT
cmlqjoq6t000yl704377d30o3	ORDER_APPROVED	Auftrag genehmigt	Auftrag "202602-002" wurde genehmigt und abgeschlossen.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "orderNumber": "202602-002"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 11:53:46.133	2026-02-17 11:53:47.165	SENT
cmlqjora90011l704wvjkwrzx	CUSTOMER_ORDER_COMPLETED	Auftrag abgeschlossen	Ihr Auftrag "202602-002" wurde erfolgreich abgeschlossen.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "orderNumber": "202602-002"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 11:53:47.553	2026-02-17 11:53:48.574	SENT
cmlqjosmd0017l7043d8888q3	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" wurde abgeschlossen.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-002"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 11:53:49.286	2026-02-17 11:53:50.403	SENT
cmlql574h000gvnd4oggump97	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202602-003" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "assignment", "orderNumber": "202602-003", "assignmentId": "cmlql5493000cvnd4jppuj6z5", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 12:34:34.194	2026-02-17 12:34:42.016	SENT
cmlql5bnq000jvnd41rifhifi	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202602-003" wurde erstellt und für 28/02/2026 geplant.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "orderNumber": "202602-003", "scheduledDate": "28/02/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 12:34:40.071	2026-02-17 12:34:43.457	SENT
cmlqjotvb001al704ab4mnkhb	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-002" wurde auf wurde abgeschlossen aktualisiert.	{"status": "wurde abgeschlossen", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-002"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 11:53:50.903	2026-02-17 11:53:53.256	SENT
cmlqjosmb0014l7040lkkg8u6	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" wurde abgeschlossen.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-002"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 11:53:49.283	2026-02-17 11:53:53.942	SENT
cmlql572n000dvnd4o9bvfve0	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202602-003" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "assignment", "orderNumber": "202602-003", "assignmentId": "cmlql544g000avnd4rm7l0cjq", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-02-17 12:34:34.128	2026-02-17 12:34:40.354	SENT
cmlqlsswu000svnd4lam5sph4	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202602-003"}	order	\N	2026-02-17 12:52:55.519	2026-02-17 12:52:59.332	SENT
cmlqlssww000vvnd45v78m9i6	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Work started on this order	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Work started on this order", "orderNumber": "202602-003"}	order	\N	2026-02-17 12:52:55.52	2026-02-17 12:53:01.004	SENT
cmlqlsvo2000yvnd4kfahsz9n	ORDER_WORK_STARTED	Arbeit begonnen	Mike Developer hat die Arbeit an Auftrag "202602-003" begonnen.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202602-003", "employeeName": "Mike Developer"}	order	\N	2026-02-17 12:52:59.09	2026-02-17 12:53:02.68	SENT
cmlqlsybi0011vnd4sus42vy3	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-003" ist in Bearbeitung.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-003"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 12:53:02.526	2026-02-17 12:53:05.423	SENT
cmlqlsygr0014vnd4k1ec52x0	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-003" ist in Bearbeitung.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-003"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 12:53:02.716	2026-02-17 12:53:07.296	SENT
cmlqlsyot0017vnd4uagtd1sv	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-003" ist in Bearbeitung.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-003"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 12:53:03.005	2026-02-17 12:53:08.898	SENT
cmlqlt1wk001avnd4yxgokazl	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-003" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-003"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-17 12:53:07.173	2026-02-17 12:53:10.484	SENT
cmlrmf0u0000dju04aawln1kq	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202602-004" wurde erstellt und für 2/27/2026 geplant.	{"orderId": "cmlrmey390000ju04avomywtl", "category": "order", "orderNumber": "202602-004", "scheduledDate": "2/27/2026"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-02-18 05:57:58.392	2026-02-18 05:58:02.646	SENT
cmlrmf2ej000gju04nf532g4e	ADMIN_CUSTOMER_ORDER_CREATED	Neuer Kundenauftrag	Global Marketing Corp von Global Marketing Corp hat einen neuen Auftrag "202602-004" erstellt.	{"orderId": "cmlrmey390000ju04avomywtl", "category": "order", "customerId": "cmk3ydjet000yvnx895zjnz1q", "creatorName": "Global Marketing Corp", "orderNumber": "202602-004", "customerName": "Global Marketing Corp"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-02-18 05:58:00.427	2026-02-18 05:58:03.749	SENT
cmlrnvd83000tvn101jy3gk7l	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202602-005" wurde erstellt und für 28/02/2026 geplant.	{"orderId": "cmlrnv8l5000gvn10ecpi1byh", "category": "order", "orderNumber": "202602-005", "scheduledDate": "28/02/2026"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-02-18 06:38:40.563	2026-02-18 06:38:45.875	SENT
cmlrnvhct000wvn107pfqmefp	ADMIN_CUSTOMER_ORDER_CREATED	Neuer Kundenauftrag	Global Marketing Corp von Global Marketing Corp hat einen neuen Auftrag "202602-005" erstellt.	{"orderId": "cmlrnv8l5000gvn10ecpi1byh", "category": "order", "customerId": "cmk3ydjet000yvnx895zjnz1q", "creatorName": "Global Marketing Corp", "orderNumber": "202602-005", "customerName": "Global Marketing Corp"}	order	cmk3zhrg1000cvnoc5g7i6gmr	2026-02-18 06:38:45.917	2026-02-18 06:38:49.681	SENT
cmltij52h0002l1040ir9xnvr	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Work completed on container CONT-1771331633063. Re...	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Work completed on container CONT-1771331633063. Re...", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:44:44.393	2026-02-19 13:44:47.402	SENT
cmltij52h0005l104xz8adql4	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Work completed on container CONT-1771331633063. Re...	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Work completed on container CONT-1771331633063. Re...", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:44:44.394	2026-02-19 13:44:49.446	SENT
cmltijm2m0006l704wiipdxq1	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Work completed on container CONT-1771331633515. Re...	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Work completed on container CONT-1771331633515. Re...", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:45:06.431	2026-02-19 13:45:09.436	SENT
cmltijm2n0009l7042xw4l7pr	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Work completed on container CONT-1771331633515. Re...	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Work completed on container CONT-1771331633515. Re...", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:45:06.431	2026-02-19 13:45:11.517	SENT
cmltijw4l000hl7048roj21dn	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Work completed on container CONT-1771331632241. Re...	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Work completed on container CONT-1771331632241. Re...", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:45:19.462	2026-02-19 13:45:23.251	SENT
cmltijw0b000el704f9ljr5bg	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Work completed on container CONT-1771331632241. Re...	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Work completed on container CONT-1771331632241. Re...", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:45:19.307	2026-02-19 13:45:21.402	SENT
cmltik40m000dl104x3orjs01	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: All containers completed. Requesting review.	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "All containers completed. Requesting review.", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:45:29.686	2026-02-19 13:45:31.465	SENT
cmltik6p6000ml104788xiaho	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-003" ist in Überprüfung.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-003"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-19 13:45:33.163	2026-02-19 13:45:34.759	SENT
cmltik40j000al1048k6pub5j	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: All containers completed. Requesting review.	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "All containers completed. Requesting review.", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:45:29.683	2026-02-19 13:45:32.217	SENT
cmltik5bu000gl104uskjis92	ORDER_REVIEW_REQUESTED	Auftragsabschluss-Überprüfung angefordert	Mike Developer hat Auftrag "202602-003" abgeschlossen und bittet um Ihre Überprüfung für die finale Genehmigung.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "employeeId": "cmk3ydfta000qvnx8erconpzd", "orderNumber": "202602-003", "employeeName": "Mike Developer"}	order	\N	2026-02-19 13:45:31.387	2026-02-19 13:45:32.876	SENT
cmltik6n0000jl104ad4wk41o	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-003" ist in Überprüfung.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-003"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-19 13:45:33.085	2026-02-19 13:45:34.117	SENT
cmltik6r9000pl104e07phrf9	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-003" ist in Überprüfung.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-003"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-19 13:45:33.237	2026-02-19 13:45:35.412	SENT
cmltik8d0000sl1049vxvisuy	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-003" wurde auf ist in Überprüfung aktualisiert.	{"status": "ist in Überprüfung", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "IN_REVIEW", "orderNumber": "202602-003"}	order	cmk3ydft9000ovnx8svln1xtu	2026-02-19 13:45:35.317	2026-02-19 13:45:37.223	SENT
cmltikyop000pl704c7mh9np3	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Order approved and marked as completed.	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Order approved and marked as completed.", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:46:09.433	2026-02-19 13:46:10.445	SENT
cmltikzlu000sl704brcg5w50	ORDER_APPROVED	Auftrag genehmigt	Auftrag "202602-003" wurde genehmigt und abgeschlossen.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "orderNumber": "202602-003"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-19 13:46:10.627	2026-02-19 13:46:11.695	SENT
cmltil01d000vl704ovuw66wd	ORDER_APPROVED	Auftrag genehmigt	Auftrag "202602-003" wurde genehmigt und abgeschlossen.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "orderNumber": "202602-003"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-19 13:46:11.185	2026-02-19 13:46:12.594	SENT
cmltil1l6000yl7040hwi40gf	CUSTOMER_ORDER_COMPLETED	Auftrag abgeschlossen	Ihr Auftrag "202602-003" wurde erfolgreich abgeschlossen.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "orderNumber": "202602-003"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-19 13:46:13.195	2026-02-19 13:46:14.172	SENT
cmltil33b0011l704dwvrjta8	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-003" wurde abgeschlossen.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-003"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-19 13:46:15.144	2026-02-19 13:46:16.137	SENT
cmltil33d0017l7047fulos5e	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-003" wurde abgeschlossen.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-003"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-19 13:46:15.145	2026-02-19 13:46:16.817	SENT
cmltil33c0014l7041k945xbj	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-003" wurde abgeschlossen.	{"orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-003"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-19 13:46:15.144	2026-02-19 13:46:18.677	SENT
cmltil4je001al7048m94i8ee	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-003" wurde auf wurde abgeschlossen aktualisiert.	{"status": "wurde abgeschlossen", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "newStatus": "COMPLETED", "orderNumber": "202602-003"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-19 13:46:17.018	2026-02-19 13:46:19.612	SENT
cmltikyoo000ml704xsoplns7	ORDER_NOTE_ADDED	Neue Auftragsnotiz	Neue Notiz zu Auftrag "202602-003" hinzugefügt: Order approved and marked as completed.	{"action": "openNotes", "orderId": "cmlql50o00000vnd4ggiyfpbt", "category": "order", "notePreview": "Order approved and marked as completed.", "orderNumber": "202602-003"}	order	\N	2026-02-19 13:46:09.433	2026-02-19 13:46:19.68	SENT
cmm0emmp50007vn88jyu4yive	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202602-006" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmm0emida0002vn889jt5n9e2", "category": "assignment", "orderNumber": "202602-006", "assignmentId": "cmm0emk6z0006vn8854bquxll", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000jvnx8bfxoe0g7	2026-02-24 09:29:51.977	2026-02-24 09:29:57.625	SENT
cmm0emqel000avn8855ji1xhw	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202602-006" wurde erstellt und für 28/02/2026 geplant.	{"orderId": "cmm0emida0002vn889jt5n9e2", "category": "order", "orderNumber": "202602-006", "scheduledDate": "28/02/2026"}	order	cmk3ydex0000jvnx8bfxoe0g7	2026-02-24 09:29:56.782	2026-02-24 09:29:59.764	SENT
cmm3rowty0005vn1kjjyg8iqm	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202602-007" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmm3roslh0000vn1kq65f4csz", "category": "assignment", "orderNumber": "202602-007", "assignmentId": "cmm3roudg0004vn1k9jac4emb", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000lvnx858c11eip	2026-02-26 17:58:51.958	2026-02-26 17:58:57.717	SENT
cmm3rp1pz0008vn1kua90nm4r	CUSTOMER_ORDER_CREATED	Neuer Auftrag erstellt	Ihr Auftrag "202602-007" wurde erstellt und für 28/02/2026 geplant.	{"orderId": "cmm3roslh0000vn1kq65f4csz", "category": "order", "orderNumber": "202602-007", "scheduledDate": "28/02/2026"}	order	cmk3ydex0000lvnx858c11eip	2026-02-26 17:58:58.296	2026-02-26 17:59:01.353	SENT
cmm3rq18x000lvn1k7drk3mum	ASSIGNMENT_CREATED	Neue Auftragszuweisung	Sie wurden dem Auftrag "202602-002" zugewiesen. Kunde: Global Marketing Corp	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "assignment", "orderNumber": "202602-002", "assignmentId": "cmm3rpyv8000kvn1kmz29sm7b", "customerName": "Global Marketing Corp"}	assignment	cmk3ydex0000lvnx858c11eip	2026-02-26 17:59:44.337	2026-02-26 17:59:48.691	SENT
cmm3rq4u4000ovn1kok3blv1a	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" wurde aktiviert.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "ACTIVE", "orderNumber": "202602-002"}	order	\N	2026-02-26 17:59:48.988	2026-02-26 17:59:51.238	SENT
cmm3rq4yk000rvn1kc8z0ue8m	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" wurde aktiviert.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "ACTIVE", "orderNumber": "202602-002"}	order	\N	2026-02-26 17:59:49.148	2026-02-26 17:59:52.734	SENT
cmm3rq8zb000uvn1kjnj23eq9	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-002" wurde auf wurde aktiviert aktualisiert.	{"status": "wurde aktiviert", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "ACTIVE", "orderNumber": "202602-002"}	order	\N	2026-02-26 17:59:54.359	2026-02-26 17:59:57.597	SENT
cmnhkxhsy000005hwyii12j3s	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" ist in Bearbeitung.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-002"}	order	\N	2026-04-02 14:38:03.874	2026-04-02 14:38:08.985	SENT
cmnhkxhte000305hw3cygw9bf	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" ist in Bearbeitung.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-002"}	order	\N	2026-04-02 14:38:03.891	2026-04-02 14:38:10.85	SENT
cmnhkxm4y000605hwldhxczy6	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-002" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-002"}	order	\N	2026-04-02 14:38:09.491	2026-04-02 14:38:12.339	SENT
cmnhkzsuo000905hweoylo30q	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" wurde aktiviert.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "ACTIVE", "orderNumber": "202602-002"}	order	\N	2026-04-02 14:39:51.504	2026-04-02 14:39:55.308	SENT
cmnhkztug000c05hwi1kf4sb7	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" wurde aktiviert.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "ACTIVE", "orderNumber": "202602-002"}	order	\N	2026-04-02 14:39:52.793	2026-04-02 14:39:57.109	SENT
cmnhkzxit000f05hwe7qasjer	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-002" wurde auf wurde aktiviert aktualisiert.	{"status": "wurde aktiviert", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "ACTIVE", "orderNumber": "202602-002"}	order	\N	2026-04-02 14:39:57.557	2026-04-02 14:40:00.386	SENT
cmnhl0ujd000i05hw3abk3z9l	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" ist in Bearbeitung.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-002"}	order	\N	2026-04-02 14:40:40.345	2026-04-02 14:40:42.917	SENT
cmnhl0unr000l05hw9ngyatxh	ORDER_STATUS_CHANGED	Auftragsstatus geändert	Auftrag "202602-002" ist in Bearbeitung.	{"orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-002"}	order	\N	2026-04-02 14:40:40.503	2026-04-02 14:40:44.587	SENT
cmnhl0x0n000o05hwlm197yut	CUSTOMER_ORDER_STATUS_CHANGED	Auftragsstatus aktualisiert	Der Status Ihres Auftrags "202602-002" wurde auf ist in Bearbeitung aktualisiert.	{"status": "ist in Bearbeitung", "orderId": "cmlqjizv70000kw04gnojumut", "category": "order", "newStatus": "IN_PROGRESS", "orderNumber": "202602-002"}	order	\N	2026-04-02 14:40:43.56	2026-04-02 14:40:46.196	SENT
\.


--
-- Data for Name: order_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_assignments (id, "orderId", "employeeId", role, "hourlyRate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_description_data; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_description_data (id, "orderId", "descriptionData", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_notes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_notes (id, "orderId", "authorId", content, "triggersStatus", category, "isInternal", "createdAt", "updatedAt") FROM stdin;
cml2hyiz00009l7041tpjfcy5	cml2hx4mi0000jj04e9bu48ai	cmk3ydft9000ovnx8svln1xtu	Work started on this order	IN_PROGRESS	GENERAL_UPDATE	f	2026-01-31 15:58:55.885	2026-01-31 15:58:55.885
cml2hyjl8000bl70483ng778c	cml2hx4mi0000jj04e9bu48ai	cmk3ydft9000ovnx8svln1xtu	Work started manually by employee at 1/31/2026, 3:58:56 PM	\N	GENERAL_UPDATE	t	2026-01-31 15:58:56.684	2026-01-31 15:58:56.684
cml2hzj7b000sl704bzwcqaf9	cml2hx4mi0000jj04e9bu48ai	cmk3ydft9000ovnx8svln1xtu	Work completed. Reported quantities: 15 cartons, 3 articles. Notes: work done	IN_REVIEW	GENERAL_UPDATE	f	2026-01-31 15:59:42.84	2026-01-31 15:59:42.84
cml2i0hfl000ejj04vjvleg5k	cml2hx4mi0000jj04e9bu48ai	cmk3ydex0000jvnx8bfxoe0g7	completed	COMPLETED	ADMIN_RESPONSE	f	2026-01-31 16:00:27.202	2026-01-31 16:00:27.202
cmlq6xija000kvn7oe94vhvvn	cmlq6vwvj0000vn7olwz1gidq	cmk3ydft9000ovnx8svln1xtu	Work started on this order	IN_PROGRESS	GENERAL_UPDATE	f	2026-02-17 05:56:41.11	2026-02-17 05:56:41.11
cmlq6xjoo000mvn7oe9ulg9q7	cmlq6vwvj0000vn7olwz1gidq	cmk3ydft9000ovnx8svln1xtu	Work started manually by employee at 17/02/2026, 10:56:42 am	\N	GENERAL_UPDATE	t	2026-02-17 05:56:42.6	2026-02-17 05:56:42.6
cmlq6yxlx0013vn7on5ebv9qy	cmlq6vwvj0000vn7olwz1gidq	cmk3ydft9000ovnx8svln1xtu	Work completed on container CONT-1771307693558. Reported: 15 cartons, 3 articles.	\N	GENERAL_UPDATE	f	2026-02-17 05:57:47.302	2026-02-17 05:57:47.302
cmlq70776001avn7o5int2t0w	cmlq6vwvj0000vn7olwz1gidq	cmk3ydft9000ovnx8svln1xtu	Work completed on container CONT-1771307694846. Reported: 20 cartons, 4 articles.	\N	GENERAL_UPDATE	f	2026-02-17 05:58:46.387	2026-02-17 05:58:46.387
cmlq70n9f001hvn7or2ulonen	cmlq6vwvj0000vn7olwz1gidq	cmk3ydft9000ovnx8svln1xtu	Work completed on container CONT-1771307695314. Reported: 25 cartons, 5 articles.	\N	GENERAL_UPDATE	f	2026-02-17 05:59:07.203	2026-02-17 05:59:07.203
cmlq76m0u001mvn7oxjdbe9qe	cmlq6vwvj0000vn7olwz1gidq	cmk3ydft9000ovnx8svln1xtu	All containers completed. Requesting review.	IN_REVIEW	GENERAL_UPDATE	f	2026-02-17 06:03:45.535	2026-02-17 06:03:45.535
cmlq7kxvn0023vn7or7q1gc4h	cmlq6vwvj0000vn7olwz1gidq	cmk3ydex0000jvnx8bfxoe0g7	Order approved and marked as completed.	COMPLETED	GENERAL_UPDATE	f	2026-02-17 06:14:54.083	2026-02-17 06:14:54.083
cmlqjku6q000kkw04lw8ez1z1	cmlqjizv70000kw04gnojumut	cmk3ydft9000ovnx8svln1xtu	Work started on this order	IN_PROGRESS	GENERAL_UPDATE	f	2026-02-17 11:50:44.69	2026-02-17 11:50:44.69
cmlqjkuse000mkw04r422vre4	cmlqjizv70000kw04gnojumut	cmk3ydft9000ovnx8svln1xtu	Work started manually by employee at 2/17/2026, 11:50:45 AM	\N	GENERAL_UPDATE	t	2026-02-17 11:50:45.47	2026-02-17 11:50:45.47
cmlqjldvb0001l704w32p7y26	cmlqjizv70000kw04gnojumut	cmk3ydft9000ovnx8svln1xtu	Work completed on container CONT-1771328891978. Reported: 15 cartons, 3 articles.	\N	GENERAL_UPDATE	f	2026-02-17 11:51:10.199	2026-02-17 11:51:10.199
cmlqjmp500006l7047mkufxye	cmlqjizv70000kw04gnojumut	cmk3ydft9000ovnx8svln1xtu	Work completed on container CONT-1771328892950. Reported: 20 cartons, 6 articles.	\N	GENERAL_UPDATE	f	2026-02-17 11:52:11.461	2026-02-17 11:52:11.461
cmlqjn8s10015kw047b3roxsk	cmlqjizv70000kw04gnojumut	cmk3ydft9000ovnx8svln1xtu	Work completed on container CONT-1771328893404. Reported: 25 cartons, 10 articles.	\N	GENERAL_UPDATE	f	2026-02-17 11:52:36.913	2026-02-17 11:52:36.913
cmlqjngdx000dl7044pn4bmih	cmlqjizv70000kw04gnojumut	cmk3ydft9000ovnx8svln1xtu	All containers completed. Requesting review.	IN_REVIEW	GENERAL_UPDATE	f	2026-02-17 11:52:46.774	2026-02-17 11:52:46.774
cmlqjonpk000ul704rgkgxdrp	cmlqjizv70000kw04gnojumut	cmk3ydex0000jvnx8bfxoe0g7	Order approved and marked as completed.	COMPLETED	GENERAL_UPDATE	f	2026-02-17 11:53:42.92	2026-02-17 11:53:42.92
cmlqlspsf000pvnd408xkjr4v	cmlql50o00000vnd4ggiyfpbt	cmk3ydft9000ovnx8svln1xtu	Work started on this order	IN_PROGRESS	GENERAL_UPDATE	f	2026-02-17 12:52:51.471	2026-02-17 12:52:51.471
cmlqlsqzi000rvnd46lgc1s3l	cmlql50o00000vnd4ggiyfpbt	cmk3ydft9000ovnx8svln1xtu	Work started manually by employee at 17/02/2026, 5:52:53 pm	\N	GENERAL_UPDATE	t	2026-02-17 12:52:53.023	2026-02-17 12:52:53.023
cmltij3r40001l10426esxmu6	cmlql50o00000vnd4ggiyfpbt	cmk3ydft9000ovnx8svln1xtu	Work completed on container CONT-1771331633063. Reported: 22 cartons, 7 articles.	\N	GENERAL_UPDATE	f	2026-02-19 13:44:42.689	2026-02-19 13:44:42.689
cmltijkqw0005l704datmrlku	cmlql50o00000vnd4ggiyfpbt	cmk3ydft9000ovnx8svln1xtu	Work completed on container CONT-1771331633515. Reported: 27 cartons, 14 articles.	\N	GENERAL_UPDATE	f	2026-02-19 13:45:04.713	2026-02-19 13:45:04.713
cmltijuv4000dl704yvh2q5bg	cmlql50o00000vnd4ggiyfpbt	cmk3ydft9000ovnx8svln1xtu	Work completed on container CONT-1771331632241. Reported: 18 cartons, 5 articles.	\N	GENERAL_UPDATE	f	2026-02-19 13:45:17.825	2026-02-19 13:45:17.825
cmltik2ll0009l10448lkek2n	cmlql50o00000vnd4ggiyfpbt	cmk3ydft9000ovnx8svln1xtu	All containers completed. Requesting review.	IN_REVIEW	GENERAL_UPDATE	f	2026-02-19 13:45:27.85	2026-02-19 13:45:27.85
cmltikxa7000ll7041wvw9w1r	cmlql50o00000vnd4ggiyfpbt	cmk3ydex0000jvnx8bfxoe0g7	Order approved and marked as completed.	COMPLETED	GENERAL_UPDATE	f	2026-02-19 13:46:07.615	2026-02-19 13:46:07.615
\.


--
-- Data for Name: order_qualifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_qualifications (id, "orderId", "qualificationId", "customerActivityId", required, "minProficiency", unit, "unitPrice", quantity, "lineTotal") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, "orderNumber", title, description, "scheduledDate", "startTime", "endTime", duration, location, "requiredEmployees", priority, "specialInstructions", status, "isArchived", "archivedAt", "estimatedHours", "actualHours", "usesTemplate", "cartonQuantity", "articleQuantity", "customerId", "createdBySubAccountId", "teamId", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
cmk3ydonc001uvnx8fooz5j8d	ORD-2024-001	\N	Website Development Project - Develop a new company website	2024-02-01 00:00:00	2024-02-01 09:00:00	2024-02-01 17:00:00	480	Remote	2	1	\N	ACTIVE	f	\N	\N	\N	f	\N	\N	cmk3ydjet000xvnx8wdteoeq3	\N	cmk3ydhca000svnx8841d1zhz	2026-01-07 11:46:40.776	2026-01-07 11:46:40.776	cmk3ydex0000jvnx8bfxoe0g7	\N
cmk3ydona001svnx80125vio1	ORD-2024-002	\N	Marketing Campaign Analysis - Analyze marketing campaign performance	2024-02-15 00:00:00	2024-02-15 10:00:00	2024-02-15 16:00:00	360	Office	1	2	\N	OPEN	f	\N	\N	\N	f	\N	\N	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-01-07 11:46:40.774	2026-01-07 11:46:40.774	cmk3ydewz000gvnx82cy8zbhf	\N
cmk3zccsv0004vnockz5pp55t	202601-001	\N	\N	2026-01-21 19:00:00	2026-01-22 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	ACTIVE	f	\N	\N	\N	f	15	55	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-01-07 12:13:38.383	2026-01-07 12:13:47.152	cmk3ydex0000jvnx8bfxoe0g7	\N
cmk41ent80000kz04k08vcq9m	202601-002	\N	\N	2026-01-15 19:00:00	2026-01-16 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	ACTIVE	f	\N	\N	\N	f	325	150	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-01-07 13:11:25.197	2026-01-07 13:11:29.697	cmk3ydex0000jvnx8bfxoe0g7	\N
cmk89estt0000vnyc7omj1l1g	202601-003	\N	\N	2026-01-21 19:00:00	2026-01-21 22:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	OPEN	f	\N	\N	\N	f	\N	\N	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-01-10 12:06:33.326	2026-01-10 12:06:35.998	cmk3zhrg1000cvnoc5g7i6gmr	\N
cmks9lo170006jm04wa05u0pf	202601-004	\N	abcd	2026-01-25 19:00:00	2026-01-26 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	ACTIVE	f	\N	\N	\N	f	560	560	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-01-24 12:07:17.227	2026-01-24 12:07:21.649	cmk3ydex0000jvnx8bfxoe0g7	\N
cmkuy27pb0004jr04wgirjv21	202601-005	\N	\N	2026-01-21 19:00:00	2026-01-22 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	ACTIVE	f	\N	\N	\N	f	800	555	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-01-26 09:07:32.351	2026-01-26 09:07:36.35	cmk3ydex0000jvnx8bfxoe0g7	\N
cml2i2j9r0018l704p66lmkfp	202601-008	\N	\N	2026-01-31 19:00:00	2026-02-01 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	container abc	OPEN	f	\N	\N	\N	f	25	5	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-01-31 16:02:02.895	2026-01-31 16:02:04.375	cmk3zhrg1000cvnoc5g7i6gmr	\N
cmky0fwkl0000vn84sl2ul7cy	202601-006	\N	iiopo	2026-01-30 19:00:00	2026-01-31 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	ACTIVE	f	\N	\N	\N	f	555	6	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-01-28 12:37:28.869	2026-01-28 12:37:38.357	cmk3ydex0000jvnx8bfxoe0g7	\N
cmlrnv8l5000gvn10ecpi1byh	202602-005	\N	\N	2026-02-27 19:00:00	2026-02-28 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	OPEN	f	\N	\N	\N	f	161	49	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-02-18 06:38:34.553	2026-02-18 06:38:37.547	cmk3zhrg1000cvnoc5g7i6gmr	\N
cmlql50o00000vnd4ggiyfpbt	202602-003	\N	\N	2026-02-27 19:00:00	2026-02-17 12:52:52.708	\N	\N	10001, New York, NY, 200 Marketing Ave	2	1	\N	COMPLETED	f	\N	\N	\N	f	67	26	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-02-17 12:34:25.824	2026-02-19 13:46:08.257	cmk3ydex0000jvnx8bfxoe0g7	\N
cmm0emida0002vn889jt5n9e2	202602-006	\N	\N	2026-02-27 19:00:00	2026-02-28 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	ACTIVE	f	\N	\N	\N	f	1	1	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-02-24 09:29:46.366	2026-02-24 09:29:54.766	cmk3ydex0000jvnx8bfxoe0g7	\N
cmlq6vwvj0000vn7olwz1gidq	202602-001	\N	\N	2026-02-27 19:00:00	2026-02-17 05:56:42.301	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	COMPLETED	f	\N	\N	\N	f	60	12	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-02-17 05:55:26.381	2026-02-17 06:14:55.062	cmk3ydex0000jvnx8bfxoe0g7	\N
cmm3roslh0000vn1kq65f4csz	202602-007	\N	  vvf	2026-02-27 19:00:00	2026-02-28 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	ACTIVE	f	\N	\N	\N	f	3	3	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-02-26 17:58:46.467	2026-02-26 17:58:55.46	cmk3ydex0000lvnx858c11eip	\N
cml2hx4mi0000jj04e9bu48ai	202601-007	\N	test	2026-01-31 19:00:00	2026-01-31 15:58:56.501	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	COMPLETED	f	\N	\N	\N	f	15	3	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-01-31 15:57:50.634	2026-01-31 16:00:27.826	cmk3ydex0000jvnx8bfxoe0g7	\N
cmlrmey390000ju04avomywtl	202602-004	\N	\N	2026-02-27 19:00:00	2026-02-28 04:00:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	OPEN	f	\N	\N	\N	f	84	41	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-02-18 05:57:54.838	2026-02-18 05:57:56.89	cmk3zhrg1000cvnoc5g7i6gmr	\N
cmlqjizv70000kw04gnojumut	202602-002	\N	\N	2026-03-02 19:00:00	2026-03-03 11:50:00	\N	\N	10001, New York, NY, 200 Marketing Ave	1	1	\N	IN_PROGRESS	f	\N	\N	\N	f	64	19	cmk3ydjet000yvnx895zjnz1q	\N	\N	2026-02-17 11:49:18.739	2026-04-02 14:40:37.559	cmk3ydex0000jvnx8bfxoe0g7	\N
\.


--
-- Data for Name: performance_thresholds; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.performance_thresholds (id, "departmentId", "redMin", "redMax", "yellowMin", "yellowMax", "greenMin", "greenMax", "createdAt", "updatedAt") FROM stdin;
cmk3ydrim002gvnx8kkwkpaa7	cmk3ydckz0002vnx8m8j4soga	0	65	66	85	86	100	2026-01-07 11:46:44.495	2026-01-07 11:46:44.495
cmk3ydril002evnx8q1bb2w2l	cmk3ydcl10003vnx86mata0xd	0	60	61	80	81	100	2026-01-07 11:46:44.493	2026-01-07 11:46:44.493
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.positions (id, title, description, level, "isActive", "departmentId", "minSalary", "maxSalary", "createdAt", "updatedAt") FROM stdin;
cmk3yddkj000bvnx8abfm98ds	HR Manager	Human Resources Manager	3	t	cmk3ydckz0002vnx8m8j4soga	60000.00	90000.00	2026-01-07 11:46:26.418	2026-01-07 11:46:26.418
cmk3yddkj0008vnx8b363lbl3	Financial Analyst	Financial data analyst	2	t	cmk3ydbpd0000vnx84l48cyad	45000.00	70000.00	2026-01-07 11:46:26.418	2026-01-07 11:46:26.418
cmk3yddkj000avnx89xy97jw7	Software Developer	Full-stack developer	2	t	cmk3ydcl10003vnx86mata0xd	50000.00	80000.00	2026-01-07 11:46:26.418	2026-01-07 11:46:26.418
cmk3yddkj0009vnx8i9wytqm9	Marketing Specialist	Digital marketing specialist	2	t	cmk3ydck70001vnx8kg7oosh6	40000.00	65000.00	2026-01-07 11:46:26.419	2026-01-07 11:46:26.419
\.


--
-- Data for Name: qualifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.qualifications (id, name, description, category, "isActive", "requiresCertificate", "expiryMonths", "createdAt", "updatedAt") FROM stdin;
cmk3ydkg60010vnx81aa45x3o	Data Analysis	Data analysis and reporting	Technical	t	f	\N	2026-01-07 11:46:35.334	2026-01-07 11:46:35.334
cmk3ydkg60013vnx81w8j7zop	Database Management	SQL and database administration	Technical	t	f	\N	2026-01-07 11:46:35.335	2026-01-07 11:46:35.335
cmk3ydkg6000zvnx84fzkv296	JavaScript Programming	Proficiency in JavaScript development	Technical	t	f	\N	2026-01-07 11:46:35.334	2026-01-07 11:46:35.334
cmk3ydkg60011vnx855ezmbd0	React Development	Frontend development with React framework	Technical	t	f	\N	2026-01-07 11:46:35.334	2026-01-07 11:46:35.334
cmk3ydkg60012vnx8zt8jkvfu	Project Management	Project management skills	Management	t	f	\N	2026-01-07 11:46:35.334	2026-01-07 11:46:35.334
cmk3ydlet0015vnx8ypi92qxv	Customer Service	Customer relationship management	Soft Skills	t	f	\N	2026-01-07 11:46:35.335	2026-01-07 11:46:35.335
cmk3ydles0014vnx8s2dpc1n3	Team Leadership	Leading and managing teams	Management	t	f	\N	2026-01-07 11:46:35.335	2026-01-07 11:46:35.335
cmk3ydlf90016vnx8dzlxe3ee	German Language	German language proficiency	Language	t	t	24	2026-01-07 11:46:35.335	2026-01-07 11:46:35.335
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ratings (id, "orderId", "employeeId", "customerId", rating, comment, category, status, "ratedBy", "ratingDate", "createdAt", "updatedAt") FROM stdin;
cmk3ydq7y0028vnx8aqsn1lty	cmk3ydonc001uvnx8fooz5j8d	cmk3ydfta000qvnx8erconpzd	cmk3ydjet000xvnx8wdteoeq3	4	Good collaboration and technical skills	Performance	GOOD	cmk3ydjet000xvnx8wdteoeq3	2026-01-07 11:46:42.815	2026-01-07 11:46:42.815	2026-01-07 11:46:42.815
cmk3ydq7y0026vnx8fum5j96m	cmk3ydonc001uvnx8fooz5j8d	cmk3ydex0000nvnx8nxzk9gb6	cmk3ydjet000xvnx8wdteoeq3	5	Excellent work quality and timely delivery	Performance	EXCELLENT	cmk3ydjet000xvnx8wdteoeq3	2026-01-07 11:46:42.815	2026-01-07 11:46:42.815	2026-01-07 11:46:42.815
cmk3yeiyu0028vniw81283xfb	cmk3ydonc001uvnx8fooz5j8d	cmk3ydex0000nvnx8nxzk9gb6	cmk3ydjet000xvnx8wdteoeq3	5	Excellent work quality and timely delivery	Performance	EXCELLENT	cmk3ydjet000xvnx8wdteoeq3	2026-01-07 11:47:20.07	2026-01-07 11:47:20.07	2026-01-07 11:47:20.07
cmk3yeiyu0027vniwnqitrgse	cmk3ydonc001uvnx8fooz5j8d	cmk3ydfta000qvnx8erconpzd	cmk3ydjet000xvnx8wdteoeq3	4	Good collaboration and technical skills	Performance	GOOD	cmk3ydjet000xvnx8wdteoeq3	2026-01-07 11:47:20.07	2026-01-07 11:47:20.07	2026-01-07 11:47:20.07
\.


--
-- Data for Name: settings_change_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.settings_change_requests (id, "userId", "requestType", "currentValue", "requestedValue", reason, status, "reviewedBy", "reviewedAt", "reviewNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sub_accounts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sub_accounts (id, name, code, "isActive", "customerId", "userId", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_config (id, key, value, description, "isActive", "createdAt", "updatedAt") FROM stdin;
cmk3ydulh002xvnx8cu10x736	company_name	Employee Management System	Company name displayed in the application	t	2026-01-07 11:46:48.485	2026-01-07 11:46:48.485
cmk3ydulh002wvnx8v38kynah	max_vacation_days	25	Maximum vacation days per year	t	2026-01-07 11:46:48.485	2026-01-07 11:46:48.485
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.team_members (id, "teamId", "employeeId", "joinedAt", "leftAt", "isActive") FROM stdin;
cmk3ydid4000wvnx8oik3ulye	cmk3ydhca000svnx8841d1zhz	cmk3ydex0000nvnx8nxzk9gb6	2026-01-07 11:46:32.632	\N	t
cmk3ydid4000vvnx8av1ijezb	cmk3ydhca000svnx8841d1zhz	cmk3ydfta000qvnx8erconpzd	2026-01-07 11:46:32.632	\N	t
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teams (id, name, description, "isActive", "teamLeaderId", "createdAt", "updatedAt") FROM stdin;
cmk3ydhca000svnx8841d1zhz	Development Team	Frontend and backend development team	t	cmk3ydex0000lvnx858c11eip	2026-01-07 11:46:31.307	2026-01-07 11:46:31.307
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, username, password, role, "isActive", "lastLogin", "refreshToken", "emailVerificationToken", "emailVerificationExpires", "passwordResetToken", "passwordResetExpires", "emailVerified", "twoFactorEnabled", "twoFactorSecret", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
cmk3ydewz000gvnx82cy8zbhf	hr@company.com	hrmanager	$2b$10$cfb5xq607nhMxFp//kxiWO3ml82/SwvE5uCWzFBNac4Pdn8RT8tLm	HR_MANAGER	t	\N	\N	\N	\N	\N	\N	t	f	\N	2026-01-07 11:46:28.163	2026-01-07 11:46:28.163	\N	\N
cmk3ydeww000cvnx8ql15tc69	employee2@company.com	employee2	$2b$10$cfb5xq607nhMxFp//kxiWO3ml82/SwvE5uCWzFBNac4Pdn8RT8tLm	EMPLOYEE	t	2026-02-17 12:54:34.655	\N	\N	\N	\N	\N	t	f	\N	2026-01-07 11:46:28.16	2026-02-17 12:54:34.656	\N	\N
cmk3zhrg1000cvnoc5g7i6gmr	info@globalmarketing.com	globalmarketingcorp	$2b$12$mX7n11wzVEwYjinFIj5oIO23XFu/OeLaTp7V5AVFnijQCSMT0c5UG	CUSTOMER	t	2026-02-18 06:35:35.403	\N	\N	\N	\N	\N	f	f	\N	2026-01-07 12:17:50.641	2026-02-18 06:35:35.404	cmk3ydex0000jvnx8bfxoe0g7	\N
cmk3ydewz000fvnx8kiidz4gy	teamleader@company.com	teamleader	$2b$10$cfb5xq607nhMxFp//kxiWO3ml82/SwvE5uCWzFBNac4Pdn8RT8tLm	TEAM_LEADER	t	2026-02-26 17:38:06.698	\N	\N	\N	\N	\N	t	f	\N	2026-01-07 11:46:28.163	2026-02-26 17:38:06.7	\N	\N
cmk3ydex0000jvnx8bfxoe0g7	admin@company.com	admin	$2b$10$cfb5xq607nhMxFp//kxiWO3ml82/SwvE5uCWzFBNac4Pdn8RT8tLm	ADMIN	t	2026-04-02 14:34:43.784	\N	\N	\N	\N	\N	t	f	\N	2026-01-07 11:46:28.164	2026-04-02 14:34:43.786	\N	\N
cmk3ydft9000ovnx8svln1xtu	employee1@company.com	employee1	$2b$10$cfb5xq607nhMxFp//kxiWO3ml82/SwvE5uCWzFBNac4Pdn8RT8tLm	EMPLOYEE	t	2026-04-02 14:38:38.428	\N	\N	\N	\N	\N	t	f	\N	2026-01-07 11:46:28.166	2026-04-02 14:38:38.43	\N	\N
\.


--
-- Data for Name: work_statistics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.work_statistics (id, date, "employeeId", "hoursWorked", "overtimeHours", location, projects, efficiency, "qualityScore", "createdAt", "updatedAt") FROM stdin;
cmk3ydqhc002bvnx8zvmphnum	2024-01-15	cmk3ydfta000qvnx8erconpzd	8.00	0.00	Remote	{"Website Development"}	0.88	0.90	2026-01-07 11:46:43.152	2026-01-07 11:46:43.152
cmk3ydqhc002cvnx83kac3wtu	2024-01-15	cmk3ydex0000nvnx8nxzk9gb6	8.50	0.50	Office	{"Website Development"}	0.95	0.92	2026-01-07 11:46:43.152	2026-01-07 11:46:43.152
\.


--
-- Name: users_sync users_sync_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neondb_owner
--

ALTER TABLE ONLY neon_auth.users_sync
    ADD CONSTRAINT users_sync_pkey PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: absences absences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT absences_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: container_articles container_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.container_articles
    ADD CONSTRAINT container_articles_pkey PRIMARY KEY (id);


--
-- Name: container_employees container_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.container_employees
    ADD CONSTRAINT container_employees_pkey PRIMARY KEY (id);


--
-- Name: containers containers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_pkey PRIMARY KEY (id);


--
-- Name: customer_activities customer_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_pkey PRIMARY KEY (id);


--
-- Name: customer_description_templates customer_description_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_description_templates
    ADD CONSTRAINT customer_description_templates_pkey PRIMARY KEY (id);


--
-- Name: customer_prices customer_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_prices
    ADD CONSTRAINT customer_prices_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employee_performance employee_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_performance
    ADD CONSTRAINT employee_performance_pkey PRIMARY KEY (id);


--
-- Name: employee_qualifications employee_qualifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_qualifications
    ADD CONSTRAINT employee_qualifications_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: notification_outbox notification_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_outbox
    ADD CONSTRAINT notification_outbox_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_recipients notification_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_assignments order_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_assignments
    ADD CONSTRAINT order_assignments_pkey PRIMARY KEY (id);


--
-- Name: order_description_data order_description_data_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_description_data
    ADD CONSTRAINT order_description_data_pkey PRIMARY KEY (id);


--
-- Name: order_notes order_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_pkey PRIMARY KEY (id);


--
-- Name: order_qualifications order_qualifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_qualifications
    ADD CONSTRAINT order_qualifications_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: performance_thresholds performance_thresholds_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.performance_thresholds
    ADD CONSTRAINT performance_thresholds_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: qualifications qualifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.qualifications
    ADD CONSTRAINT qualifications_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: settings_change_requests settings_change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings_change_requests
    ADD CONSTRAINT settings_change_requests_pkey PRIMARY KEY (id);


--
-- Name: sub_accounts sub_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sub_accounts
    ADD CONSTRAINT sub_accounts_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: work_statistics work_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_statistics
    ADD CONSTRAINT work_statistics_pkey PRIMARY KEY (id);


--
-- Name: users_sync_deleted_at_idx; Type: INDEX; Schema: neon_auth; Owner: neondb_owner
--

CREATE INDEX users_sync_deleted_at_idx ON neon_auth.users_sync USING btree (deleted_at);


--
-- Name: audit_logs_tableName_recordId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "audit_logs_tableName_recordId_idx" ON public.audit_logs USING btree ("tableName", "recordId");


--
-- Name: audit_logs_userId_timestamp_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "audit_logs_userId_timestamp_idx" ON public.audit_logs USING btree ("userId", "timestamp");


--
-- Name: container_employees_containerId_employeeId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "container_employees_containerId_employeeId_key" ON public.container_employees USING btree ("containerId", "employeeId");


--
-- Name: containers_serialNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "containers_serialNumber_key" ON public.containers USING btree ("serialNumber");


--
-- Name: customer_activities_customerId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "customer_activities_customerId_idx" ON public.customer_activities USING btree ("customerId");


--
-- Name: customer_activities_orderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "customer_activities_orderId_idx" ON public.customer_activities USING btree ("orderId");


--
-- Name: customer_description_templates_customerId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "customer_description_templates_customerId_key" ON public.customer_description_templates USING btree ("customerId");


--
-- Name: customer_prices_customerActivityId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "customer_prices_customerActivityId_idx" ON public.customer_prices USING btree ("customerActivityId");


--
-- Name: customer_prices_customerId_customerActivityId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "customer_prices_customerId_customerActivityId_idx" ON public.customer_prices USING btree ("customerId", "customerActivityId");


--
-- Name: customer_prices_customerId_customerActivityId_minQuantity_m_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "customer_prices_customerId_customerActivityId_minQuantity_m_key" ON public.customer_prices USING btree ("customerId", "customerActivityId", "minQuantity", "maxQuantity", "effectiveFrom");


--
-- Name: customer_prices_customerId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "customer_prices_customerId_idx" ON public.customer_prices USING btree ("customerId");


--
-- Name: customers_taxNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "customers_taxNumber_key" ON public.customers USING btree ("taxNumber");


--
-- Name: customers_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "customers_userId_key" ON public.customers USING btree ("userId");


--
-- Name: departments_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX departments_code_key ON public.departments USING btree (code);


--
-- Name: departments_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX departments_name_key ON public.departments USING btree (name);


--
-- Name: employee_performance_employeeId_periodStart_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "employee_performance_employeeId_periodStart_idx" ON public.employee_performance USING btree ("employeeId", "periodStart");


--
-- Name: employee_qualifications_employeeId_qualificationId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "employee_qualifications_employeeId_qualificationId_key" ON public.employee_qualifications USING btree ("employeeId", "qualificationId");


--
-- Name: employees_employeeCode_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "employees_employeeCode_key" ON public.employees USING btree ("employeeCode");


--
-- Name: employees_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "employees_userId_key" ON public.employees USING btree ("userId");


--
-- Name: notification_outbox_lockedUntil_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "notification_outbox_lockedUntil_idx" ON public.notification_outbox USING btree ("lockedUntil");


--
-- Name: notification_preferences_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "notification_preferences_userId_key" ON public.notification_preferences USING btree ("userId");


--
-- Name: notification_recipients_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "notification_recipients_userId_createdAt_idx" ON public.notification_recipients USING btree ("userId", "createdAt");


--
-- Name: notification_templates_key_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX notification_templates_key_key ON public.notification_templates USING btree (key);


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: order_assignments_orderId_employeeId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "order_assignments_orderId_employeeId_key" ON public.order_assignments USING btree ("orderId", "employeeId");


--
-- Name: order_description_data_orderId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "order_description_data_orderId_key" ON public.order_description_data USING btree ("orderId");


--
-- Name: order_notes_orderId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "order_notes_orderId_createdAt_idx" ON public.order_notes USING btree ("orderId", "createdAt");


--
-- Name: order_qualifications_orderId_qualificationId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "order_qualifications_orderId_qualificationId_key" ON public.order_qualifications USING btree ("orderId", "qualificationId");


--
-- Name: orders_isArchived_scheduledDate_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "orders_isArchived_scheduledDate_idx" ON public.orders USING btree ("isArchived", "scheduledDate");


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: performance_thresholds_departmentId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "performance_thresholds_departmentId_key" ON public.performance_thresholds USING btree ("departmentId");


--
-- Name: positions_title_departmentId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "positions_title_departmentId_key" ON public.positions USING btree (title, "departmentId");


--
-- Name: qualifications_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX qualifications_name_key ON public.qualifications USING btree (name);


--
-- Name: settings_change_requests_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "settings_change_requests_status_createdAt_idx" ON public.settings_change_requests USING btree (status, "createdAt");


--
-- Name: settings_change_requests_userId_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "settings_change_requests_userId_status_idx" ON public.settings_change_requests USING btree ("userId", status);


--
-- Name: sub_accounts_customerId_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "sub_accounts_customerId_name_key" ON public.sub_accounts USING btree ("customerId", name);


--
-- Name: sub_accounts_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "sub_accounts_userId_key" ON public.sub_accounts USING btree ("userId");


--
-- Name: system_config_key_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX system_config_key_key ON public.system_config USING btree (key);


--
-- Name: team_members_teamId_employeeId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "team_members_teamId_employeeId_key" ON public.team_members USING btree ("teamId", "employeeId");


--
-- Name: teams_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX teams_name_key ON public.teams USING btree (name);


--
-- Name: teams_teamLeaderId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "teams_teamLeaderId_key" ON public.teams USING btree ("teamLeaderId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: work_statistics_employeeId_date_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "work_statistics_employeeId_date_key" ON public.work_statistics USING btree ("employeeId", date);


--
-- Name: absences absences_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT "absences_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignments assignments_customerActivityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "assignments_customerActivityId_fkey" FOREIGN KEY ("customerActivityId") REFERENCES public.customer_activities(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: assignments assignments_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignments assignments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "assignments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignments assignments_pausedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "assignments_pausedById_fkey" FOREIGN KEY ("pausedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: assignments assignments_startedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "assignments_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: assignments assignments_stoppedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "assignments_stoppedById_fkey" FOREIGN KEY ("stoppedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: container_articles container_articles_containerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.container_articles
    ADD CONSTRAINT "container_articles_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES public.containers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: container_employees container_employees_containerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.container_employees
    ADD CONSTRAINT "container_employees_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES public.containers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: container_employees container_employees_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.container_employees
    ADD CONSTRAINT "container_employees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: containers containers_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT "containers_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_activities customer_activities_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT "customer_activities_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_activities customer_activities_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT "customer_activities_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_description_templates customer_description_templates_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_description_templates
    ADD CONSTRAINT "customer_description_templates_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_prices customer_prices_customerActivityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_prices
    ADD CONSTRAINT "customer_prices_customerActivityId_fkey" FOREIGN KEY ("customerActivityId") REFERENCES public.customer_activities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_prices customer_prices_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_prices
    ADD CONSTRAINT "customer_prices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customers customers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: departments departments_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employee_performance employee_performance_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_performance
    ADD CONSTRAINT "employee_performance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employee_performance employee_performance_manualOverrideById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_performance
    ADD CONSTRAINT "employee_performance_manualOverrideById_fkey" FOREIGN KEY ("manualOverrideById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employee_qualifications employee_qualifications_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_qualifications
    ADD CONSTRAINT "employee_qualifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employee_qualifications employee_qualifications_qualificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_qualifications
    ADD CONSTRAINT "employee_qualifications_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES public.qualifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_positionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES public.positions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: files files_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public.assignments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: files files_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: files files_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_outbox notification_outbox_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_outbox
    ADD CONSTRAINT "notification_outbox_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public.notifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_recipients notification_recipients_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT "notification_recipients_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public.notifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_recipients notification_recipients_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT "notification_recipients_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_assignments order_assignments_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_assignments
    ADD CONSTRAINT "order_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_assignments order_assignments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_assignments
    ADD CONSTRAINT "order_assignments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_description_data order_description_data_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_description_data
    ADD CONSTRAINT "order_description_data_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_notes order_notes_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT "order_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_notes order_notes_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT "order_notes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_qualifications order_qualifications_customerActivityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_qualifications
    ADD CONSTRAINT "order_qualifications_customerActivityId_fkey" FOREIGN KEY ("customerActivityId") REFERENCES public.customer_activities(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_qualifications order_qualifications_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_qualifications
    ADD CONSTRAINT "order_qualifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_qualifications order_qualifications_qualificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_qualifications
    ADD CONSTRAINT "order_qualifications_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES public.qualifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_createdBySubAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_createdBySubAccountId_fkey" FOREIGN KEY ("createdBySubAccountId") REFERENCES public.sub_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: performance_thresholds performance_thresholds_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.performance_thresholds
    ADD CONSTRAINT "performance_thresholds_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: positions positions_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT "positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ratings ratings_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT "ratings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ratings ratings_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT "ratings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ratings ratings_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT "ratings_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: settings_change_requests settings_change_requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings_change_requests
    ADD CONSTRAINT "settings_change_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sub_accounts sub_accounts_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sub_accounts
    ADD CONSTRAINT "sub_accounts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sub_accounts sub_accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sub_accounts
    ADD CONSTRAINT "sub_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_members team_members_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "team_members_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_members team_members_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teams teams_teamLeaderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "teams_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: work_statistics work_statistics_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_statistics
    ADD CONSTRAINT "work_statistics_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict b2WGIZHkenOo2EhoNTO3tTjDYsYnN0VxSRRzg2OwyI5d8fMgqWwCA4jjTfSbplx

