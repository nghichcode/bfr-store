const ROLE = {
  'admin':1,
  'user':2,
  'guest':3,
};
const ROLE_NAME = {
  1:'admin',
  2:'user',
  3:'guest',
};

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
    token: '',
    refresh_token: '',
  },
  mapobj: function (obj){
    for(i in obj){
      if(i in this.properties && i!='id' && obj[i]){
        this.properties[i]=isNaN(obj[i])?obj[i]:parseInt(obj[i]);
      }
    }
  }
};

const UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'int',
    username:  'string',
    first_name: 'string',
    last_name: 'string',
    email: 'string',
    permission_id: 'int'
  }
};
const UserObj = {
  name: 'User',
  properties: {
    id: 1,
    username:  '',
    first_name: '',
    last_name: '',
    email: '',
    permission_id:3
  },
  mapobj: function (obj){
    for(i in obj){
      if(i in this.properties && i!='id' && obj[i]){
        this.properties[i]=isNaN(obj[i])?obj[i]:parseInt(obj[i]);
      }
    }
  }
};
const UserLabel = {
  name: 'User',
  properties: {
    username:  'Tên tài khoản:',
    first_name: 'Họ:',
    last_name: 'Tên:',
    email: 'Email:',
    permission_id: 'Quyền:'
  }
};

const StoreSchema = {
  name: 'Store',
  primaryKey: 'id',
  properties: {
    id: 'int',
    storename: 'string',
    location:  'string',
    hide_detail: 'int',
    description: 'string',
  }
};
const StoreObj = {
  name: 'Store',
  properties: {
    id: 1,
    storename: '',
    location:  '',
    hide_detail: 1,
    description: '',
  },
  mapobj: function (obj){
    for(i in obj){
      if(i in this.properties && i!='id' && obj[i]){
        this.properties[i]=isNaN(obj[i])?obj[i]:parseInt(obj[i]);
      }
    }
  }
};
const StoreLabel = {
  name: 'Store',
  properties: {
    storename: 'Tên cửa hàng:',
    location:  'Vị trí:',
    hide_detail: 'Ẩn thông tin:',
    description: 'Mô tả:',
  }
};

export {
	TokenSchema,UserSchema,StoreSchema,
  TokenObj,UserObj,StoreObj,
  UserLabel,StoreLabel,
  ROLE_NAME,ROLE,
};
