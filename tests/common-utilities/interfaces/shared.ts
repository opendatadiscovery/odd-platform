export interface FileData {
  filepath: string;
  filenameWithExtension: string;
  filenameWithoutExtension: string;
  extension: string;
}

export interface ThirdPartyCredentials {
  clientId: string;
  clientSecret: string;
  grantType: string;
  boxSubjectType: string;
  boxSubjectId: string;
  asUser: string;
  accessToken: string;
  selectUser: string;
  microsoftAuthenticateUrl: string;
  microsoftLogin: string;
  boxLogin: string;
  dropboxLogin: string;
  googleLogin: string;
  onedriveDriveId: string;
  sharepointDriveId: string;
  gdriveDriveId: string;
  sharepointSiteId: string;
  dropboxRootId: string;
  awsAccessKey: string;
  awsSecretKey: string;
  s3Bucket: string;
  roleArn: string;
  salesforceLogin: string;
  salesforcePassword: string;
}
