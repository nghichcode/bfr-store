import { TokenObj, UserObj, StoreObj } from './models.js'

const ROLE = {
  'admin':1,
  'user':2,
  'guest':3,
};

function saveToken(realm, json) {
	if (!realm) {return;}
  const tokens = TokenObj;tokens.mapobj(json);
  const found = realm.objects(tokens.name).findIndex((it)=>tokens.properties.id==it.id);

  if(found==-1){
    realm.write(() => {
      realm.create(tokens.name, tokens.properties);
    });
  } else {
    realm.write(() => {
      realm.create(tokens.name, tokens.properties, 'modified');
    });
    // const token = realm.objects(tokens.name).filtered('id == $0', tokens.properties.id);
  }
  console.log('model_utils.js:0',realm.objects(tokens.name));
}

function getToken(realm) {
	if (!realm) {return;}
  const tokens = TokenObj;
  const found = realm.objects(tokens.name).findIndex((it)=>tokens.properties.id==it.id);

  if(found!=-1){
    const token = realm.objects(tokens.name).filtered('id == $0', tokens.properties.id);
    if (token && token.length>0) {
      return token[0];
    }
  }
	return false;
}

function saveUser(realm, json) {
  if (!realm) {return;}
  const tokens = TokenObj;tokens.mapobj(json.tokens);

  var found = realm.objects(tokens.name).findIndex((it)=>tokens.properties.id==it.id);
  if(json.tokens){
    if(found==-1){
      realm.write(() => {
        realm.create(tokens.name, tokens.properties);
      });
    } else {
      realm.write(() => {
        realm.create(tokens.name, tokens.properties, 'modified');
      });
    }
    // console.log('model_utils.js:1',realm.objects(tokens.name));
  }

  const user = UserObj;user.mapobj(json.user);
  if(json.user) {
    found = realm.objects(user.name).findIndex((it)=>user.properties.id==it.id);
    if(found==-1){
      realm.write(() => {
        realm.create(user.name, user.properties);
      });
    } else {
      realm.write(() => {
        realm.create(user.name, user.properties, 'modified');
      });
    }
    // console.log('model_utils.js:2',realm.objects(user.name));
  }

  if(user.properties.permission_id==ROLE.admin){return;}
  if(json.store) {
    const store = StoreObj;store.mapobj(json.store);
    found = realm.objects(store.name).findIndex((it)=>store.properties.id==it.id);
    if(found==-1){
      realm.write(() => {
        realm.create(store.name, store.properties);
      });
    } else {
      realm.write(() => {
        realm.create(store.name, store.properties, 'modified');
      });
    }
    // console.log('model_utils.js:3',realm.objects(store.name));
  }

}

function getUser(realm) {
  if (!realm) {return;}
  var result = {user:null,store:null,};
  var one = null;
  const store = StoreObj;

  const tokens = TokenObj;
  var found = realm.objects(tokens.name).findIndex((it)=>tokens.properties.id==it.id);
  let token = null;

  if(found!=-1){
    token = realm.objects(tokens.name).filtered('id == $0', tokens.properties.id);
    if (token && token.length>0) {
      tokens.mapobj(token[0]);
    }
  }
  if(found!=-1 && tokens.properties.token && !tokens.properties.refresh_token){
    found = realm.objects(store.name).findIndex((it)=>store.properties.id==it.id);
    if(found!=-1){
      const one = realm.objects(store.name).filtered('id == $0', store.properties.id);
      result.store = (one && one.length>0)?one[0]:null;
    }
    return result;
  }
  // console.log('model_utils.js:a1',realm.objects(tokens.name));

  const user = UserObj;
  found = realm.objects(user.name).findIndex((it)=>user.properties.id==it.id);
  if(found!=-1){
    const one = realm.objects(user.name).filtered('id == $0', user.properties.id);
    result.user = (one && one.length>0)?one[0]:null;
  }
  // console.log('model_utils.js:a2',realm.objects(user.name));

  if(result.user.permission_id!=ROLE.user){return result;}
  found = realm.objects(store.name).findIndex((it)=>store.properties.id==it.id);
  if(found!=-1){
    const one = realm.objects(store.name).filtered('id == $0', store.properties.id);
    result.store = (one && one.length>0)?one[0]:null;
  }
  // console.log('model_utils.js:a3',realm.objects(store.name));

  return result;
}


export {
	saveToken, getToken,
  saveUser, getUser
};
