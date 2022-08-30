export interface MyProfile {
  id: number;
  first_name: string;
  feature_flags: string[];
  last_name: string;
  client: number;
  role: number;
  username: string;
  email: string;
  avatar: string;
  client_config: ClientConfig;
  email_notification: boolean | null;
  client_name: string;
  segment_info: SegmentInfo;
  job_title: string;
  root_folder: number;
  is_workflow_admin: boolean;
}

interface ClientConfig {
  id: number;
  upload_form_fields: UploadFormFields[];
  feature_flags: string[];
  sub_domain: string;
  sync_type: string;
}

interface UploadFormFields {
  id: number;
  type: string;
  values: UploadFormFieldsValues[];
  label: string;
  allow_new_options: boolean;
}

interface UploadFormFieldsValues {
  value: string;
  display_value: string;
}

interface SegmentInfo {
  num_docs: number;
  num_billable_docs: number;
  num_users: number;
  last_sync_date: string | null;
  position: string;
  client_type: string;
  storage_provider: string;
  ai_activation: boolean;
}
