// @ts-nocheck
import { AuthModel } from './auth.model';
import { AddressModel } from './address.model';
import { SocialNetworksModel } from './social-networks.model';

export class UserModel extends AuthModel {
  empid?:number;
  locAddress?: string;
  userid?: number;
  ProfileId?: number;
  ReqPath?: number;
  username?: string;
  title?: string;
  firstname?: string;
  lastname?: string;
  fullname?: string;
  age?: string;
  gender?: string;
  phone?: string;
  email?: string;
  image?: string;
  locationid?: number;
  provinceID?: number;
  currentLocation: string; // this 
  currentLocationID: Number; // this 
  currentMachineName: string; // this 
  currentuserDomainName: string; // this 
  currenUserName: string; // this 
  provinceName: string;
  ParentLocID: number;
  cityCode: string;
  type?: string;
  sessionTime: number;
  token: string;
  macAdr: string;
  posId: string;
  RoleCategory: string;
  // taxPercent: number;

  id: number;
  // username: string;
  password: string;
  // fullname: string;
  // email: string;
  pic: string;
  roles: number[];
  occupation: string;
  companyName: string;
  // phone: string;
  address?: AddressModel;
  socialNetworks?: SocialNetworksModel;
  // personal information
  // firstname: string;
  // lastname: string;
  website: string;
  // account information
  language: string;
  timeZone: string;
  communication: {
    email: boolean,
    sms: boolean,
    phone: boolean
  };
  // email settings
  emailSettings: {
    emailNotification: boolean,
    sendCopyToPersonalEmail: boolean,
    activityRelatesEmail: {
      youHaveNewNotifications: boolean,
      youAreSentADirectMessage: boolean,
      someoneAddsYouAsAsAConnection: boolean,
      uponNewOrder: boolean,
      newMembershipApproval: boolean,
      memberRegistration: boolean
    },
    updatesFromKeenthemes: {
      newsAboutKeenthemesProductsAndFeatureUpdates: boolean,
      tipsOnGettingMoreOutOfKeen: boolean,
      thingsYouMissedSindeYouLastLoggedIntoKeen: boolean,
      newsAboutMetronicOnPartnerProductsAndOtherServices: boolean,
      tipsOnMetronicBusinessProducts: boolean
    },
  };


  setUser(user: any) {
    
    this.RoleCategory = user.RoleCategory || '';
    this.userid = user.UserId || null;
    this.ProfileId = user.ProfileId || null;
    this.empid = user.EmpId || null;
    this.locAddress = user.LocAddress || null;
    this.username = user.UserName || '';
    this.ReqPath = user.ReqPath || '';
    this.title = user.Title || '';
    this.firstname = user.FirstName || '';
    this.lastname = user.LastName || '';
    this.fullname = user.UserFullName || '';
    this.age = user.age || 0;
    this.gender = user.gender || '';
    this.phone = user.phone || '';
    this.email = user.email || '';
    this.image = user.image || '';
    this.locationid = user.RegLocId || 0;
    this.currentLocation = user.BranchName,// user.CurrentLocation || '';
    this.ParentLocID = user.ParentLocID || '';
    this.cityCode = user.CityCode || '';
    this.type = user.type || '';
    this.sessionTime = user.sessionTime || 1800;
    this.token = user.Token || '';
    this.macAdr = user.macAdr || '';
    this.posId = user.posId || '';
    this.provinceID = user.ProvinceID || '';
    this.provinceName = user.ProvinceName || '';
    // this.taxPercent = user.taxPercent || 0;

    // this.id = user.id;
    // this.username = user.username || '';
    // this.password = user.password || '';
    // this.fullname = user.fullname || '';
    // this.email = user.email || '';

    this.pic = this.getImageWithPerfix(user.pic);
    // this.roles = user.roles || [];
    // this.occupation = user.occupation || '';
    // this.companyName = user.companyName || '';
    // this.phone = user.phone || '';
    this.address = user.address;
    // this.socialNetworks = user.socialNetworks;
  }

  getImageWithPerfix(pic) {
    let _pic = pic;
    if (!pic) {
      _pic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAJFBMVEXFxcX////CwsLKysrw8PDo6Oj4+PjW1tbOzs7a2trS0tLg4OA0aLcBAAAE20lEQVR4nO2d23arMAxEqcOd///fg+vSkDZNCNJI4xztxz5lluQZgbHbNEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQ2JNu8f45umRBl3lalq7NdMsyDWP+s/cP02HVMS9t33/8oG+7VWb1KtfaTd0vcVfaZW5q1pguwyN5m8ixUpGpGaen8kq/dlUWMo3Py7cr5FSbxtQsx+UVjWNNElNzsD9v6C7VaFwb9HV9K/3k/csPks4UsKIypsu5An6VceaXOLYCgSuLt4BnzKc7dKPzlvAQwRKsROIk17fSXrx1/EXSEUgscVASSNuocpPhlphGRYFraPDl4kWYgz8Z2CQmySRzj370lnSLmo1eab013aC8CAtc85t2j2aY+hTQoxmmPlX20Q0eP331ncxRaKY3hM0UWHIfYTOFnqOIF1gJSYoIMtICh52CjLRAYKdpRgr86AgU4nwmQzDYIH0mM3kXMem9uriPu9eAm5QhEsFN6u6maUQL9HZTaNwXnBcifBn65wV0oCn4brih0zDjmogGRuNsNfC8z7SuCvFW6mymCfWGZk///go95zaDOFwJhaEwFP7nCt/fS98/D99/pjGZS10Vvv2zhcnzofPujMEzvu/LNotA9H1PYxAXrmEB33nKeO8+4a3Ge2sGv2/hvb0Gn2rc956An5oUCL5VACei/xET8Gjq36RoNyVoUmzo++8AZ5Bew1DCBuo1/j6TAU5u3hPbN6i5xn2e+QZlpySrsIHZKYeRFrQPzBQIvkv8BjLYkJ3u0u9Tph79RL1POaLwivq5IB4f3VBeimSLsKD5tE9zluQWPbfpSS86UXsrxSqw0RpQqS/H0GhU4gpm5BLpLxuS3ozBf0VNmkXTDdfh3/skgd9Qe8yes53K36Eb525S6pmeB5/y+nVffV130qVmeFVhO9SjMDUvXSh4rWJXxxWRa/nas5HYV1DIrO+kvAK5RrE+co0q+r40UpKkt+3tNRJO32vIa76K6unGmzRob120VFd9yu67/AumMmre1Lajp3Ec3EY+xdNiwuw7fcFgqqAO3ehnb4EaF5Y+lujsqRbnLVwXo8mhoDU2vPRBUpBIIibmiSRiU+InHrttpgI9JBq2aMG8Ua0Fmku0F2i7tW9ysPI3htFvca7yHlYDXAIP239jtDUFuTP4qESbD05tg/AWk8MJHjZ6BW+oJmebH4HeZPRchAX4UvRchAXsUnSK+luQ32X692gG+s2Uf49mcH1K0aMZWJ9aXKBwCNhH7r5ZvweT+wZH74+DGcE5bKaAMBuTy3aOA7iHgMZmCvpmQ5MUG+qJQVZC/SLSlVC9iHQl1C4iYQmVi0hYQt0iur+6uI/mCw2mceaK3mBDNZHuUZtOKX0mo+Y1lD6T0fIaspl7j9b8zekzGSWvsbjf8iwqr4dpfSaj4zW8TarUpqxhWFCIROom1WlT5iZVaVNmJ82I3ZQ47gvy0OduUoU2pZ1JN6SzKe2D0xVhXpBnRUaaF+zLULwQ6ZehdCFWsAyFC5E+DTOiRLT5LytCZBdk8huN0GoqMBqZ1VRhNCKrqcJoRFZTwUSTkUw1NVipzGpqsFKZwhqsVPRfTNjfYGycfpNRSVgI4oJ06/c3pzeDK4lDQSBWEoeCQKziySJz+umiHoUnBdYS+E8i/x+8KltM3AFtrQAAAABJRU5ErkJggg==';
      return _pic;
    }
    if (_pic.indexOf('data:') == -1) { // check if image prefix is already appended
      _pic = 'data:' + 'image/png' + ';base64,' + _pic;
    }
    return _pic;
  }
}



