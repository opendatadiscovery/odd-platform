import { MyProfile } from './interfaces/my-profile';
import pilot from './pilot';

export default class AppService {
  /**
   * Gets current user profile data
   */
  static async get_profile_data(): Promise<MyProfile> {
    return (await pilot.get('user/my-profile')).data;
  }
}
