import { MyProfile } from './interfaces/my-profile';
import pilot from './pilot';

export default class AppService {
  /**
   * Gets current user profile data
   */
  static async getProfileData(): Promise<MyProfile> {
    return (await pilot.get('user/my-profile')).data;
  }
}
