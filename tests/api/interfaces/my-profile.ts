export interface MyProfile {
  id: number;
  firstName: string;
  featureFlags: string[];
  lastName: string;
  client: number;
  role: number;
  username: string;
  email: string;
  avatar: string;
  clientConfig: ClientConfig;
  emailNotification: boolean | null;
  clientName: string;
  segmentInfo: SegmentInfo;
  jobTitle: string;
  rootFolder: number;
  isWorkflowAdmin: boolean;
}

interface ClientConfig {
  id: number;
  uploadFormFields: UploadFormFields[];
  featureFlags: string[];
  subDomain: string;
  syncType: string;
}

interface UploadFormFields {
  id: number;
  type: string;
  values: UploadFormFieldsValues[];
  label: string;
  allowNewOptions: boolean;
}

interface UploadFormFieldsValues {
  value: string;
  displayValue: string;
}

interface SegmentInfo {
  numDocs: number;
  numBillableDocs: number;
  numUsers: number;
  lastSyncDate: string | null;
  position: string;
  clientType: string;
  storageProvider: string;
  aiActivation: boolean;
}
