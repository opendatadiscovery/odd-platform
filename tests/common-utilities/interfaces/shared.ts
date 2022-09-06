export interface FileData {
  filepath: string;
  filename_with_extension: string;
  filename_without_extension: string;
  extension: string;
}

export interface ThirdPartyCredentials {
  client_id: string;
  client_secret: string;
  grant_type: string;
  box_subject_type: string;
  box_subject_id: string;
  as_user: string;
  access_token: string;
  select_user: string;
  microsoft_authenticate_url: string;
  microsoft_login: string;
  box_login: string;
  dropbox_login: string;
  google_login: string;
  onedrive_drive_id: string;
  sharepoint_drive_id: string;
  gdrive_drive_id: string;
  sharepoint_site_id: string;
  dropbox_root_id: string;
  aws_access_key: string;
  aws_secret_key: string;
  s3_bucket: string;
  role_arn: string;
  salesforce_login: string;
  salesforce_password: string;
}
