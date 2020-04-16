import { TokenObj } from './models.js'

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
  console.log(realm.objects(tokens.name));
}

function getToken(realm) {
	if (!realm) {return;}
  const tokens = TokenObj;
  const found = realm.objects(tokens.name).findIndex((it)=>tokens.properties.id==it.id);

  if(found==-1){
  	return false;
  } else {
    const token = realm.objects(tokens.name).filtered('id == $0', tokens.properties.id);
    if (token && token.length>0) {}
    return token[0];
  }
}

export {
	saveToken, getToken
};
