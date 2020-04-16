const TokenSchema = {
  name: 'Token',
  primaryKey: 'id',
  properties: {
    id: 'int',
    token: 'string',
    refresh_token: 'string',
  }
};
const TokenObj = {
  name: 'Token',
  properties: {
    id: 1,
    token:  '',
    refresh_token: '',
  },
  mapobj: function (obj){
    this.properties.token=obj.token;
    this.properties.refresh_token=obj.refresh_token;
  }
};

const UserSchema = {
  name: 'Token',
  properties: {
    name:  'string',
    email: 'string',
  }
};

export {
	TokenSchema,TokenObj,UserSchema
};
