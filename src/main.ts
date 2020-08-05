import {Profile} from './halo';

(async () => {
  try {
    let profile = await Profile.findProfile('xXDIRTYBOMBXx');
    console.log(profile);
  } catch (e) {
  }
})();