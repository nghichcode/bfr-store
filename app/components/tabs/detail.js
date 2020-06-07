import Geolocation from '@react-native-community/geolocation';

import React from 'react';
import {TouchableOpacity,TextInput,View,Text,ScrollView,Alert} from 'react-native';
import {Overlay,ListItem,Input,CheckBox,Image} from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

import config from '../../config.js';
import crypt_lib from '../../crypt_lib.js';
import { getUser,getToken,saveUser,saveToken } from '../../models/model_utils.js';
import { parseForm } from '../../utils.js';
import { UserObj,StoreObj,UserLabel,StoreLabel,ROLE_NAME } from '../../models/models.js';
import {styles} from '../styles/round_theme.js';

/* Example location returned
{
  speed: -1,
  longitude: -0.1337,
  latitude: 51.50998,
  accuracy: 5,
  heading: -1,
  altitude: 0,
  altitudeAccuracy: -1
  floor: 0
  timestamp: 1446007304457.029,
  fromMockProvider: false
}
*/


class DetailTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      locations: null,
      update_location:false,
      enable_gps: false,
      user_data:null,user_list:null,tokens:null,image:null,
      loading:false,old_password:'',password:'',password1:'',
      is_edit:false,change_pass:false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    if(this.mounted) {
      this.initUser(this.props.realm);
      const tokens = getToken(this.props.realm);
      this.setState({update_location:false, tokens});
      // this.enableGPS();
    }
  }
  componentWillUnmount(){this.mounted = false;}

  initUser = (realm) => {
    const user_data = getUser(realm);
    this.mapUserList(user_data);//console.log('detail.js:51',user_data);
  }

  mapUserList = (user_data={}) => {
    // console.log('detail.js:54',user_data);
    const user_list = {user:[],store:[],};

    const user = new UserObj();//Map user
    if(user_data.user){
      user.mapobj(user_data.user);
      for (let i in user.properties) {
        if (i!='id') {
          const obj = { name:i, label:UserLabel.properties[i], };
          if(i=='permission_id') {
            obj.value = ROLE_NAME[user.properties[i]];
          } else {
            obj.value = user.properties[i];
          }
          user_list.user.push(obj);
        }
      }
    }

    const store = new StoreObj();
    store.mapobj(user_data.store);
    if( user_data.user && user_data.store ){
      for (let i in store.properties) {
        if (i!='id') {
          const obj = { name:i, label:StoreLabel.properties[i], };
          if(i=='hide_detail') {
            obj.value = store.properties[i]==1?'Đã ẩn':'Hiện';
          } else {
            obj.value = store.properties[i];
          }
          user_list.store.push(obj);
        }
      }
    } else if(user_data.store){
      user_list.store.push({
        name:'location',
        label:StoreLabel.properties['location'],
        value:store.properties['location'],
      });
    }

    this.setState({user_data:{
      user:user_data.user?user.properties:null,store:user_data.store?store.properties:null
    }});
    this.setState({user_list});
    // console.log('detail.js:2',user_list);
  }

  enableGPS = () => {
    const self = this;
    Geolocation.getCurrentPosition(
      function(locations) {
        const {user_data} = self.state;
        user_data.store.location = locations.coords.latitude+';'+locations.coords.longitude;

        let store=null;
        if(user_data && user_data.store) {
          store=new StoreObj();store.mapobj(user_data.store);
        }
        saveUser(self.props.realm, { store:store?store.properties:null, });
        // console.log('detail.js:107',user_data);
        self.mapUserList(user_data);
        self.setState({enable_gps:true,update_location:true});
      },
      function(error) {
        Alert.alert("Lỗi", error.message,[{text: "OK"}],{ cancelable: false });
        self.setState({enable_gps:false});
      },
    );
  }

  updateProfile = () => {
    const self = this;
    const {realm} = this.props;
    const {user_data,tokens,image} = this.state;
    const maxs = config.max_size;
    if(image && (image.width>maxs.width || image.height>maxs.height)) {
      Alert.alert("Lỗi", 'Kích thước ảnh không được vượt quá '+maxs.width+'x'+maxs.height+' pixel',
        [{text: "OK"}],{ cancelable: false }
      );
      return;
    }
    this.setState({loading:true});
    // console.log('detail.js:124',user_data);

    if(!tokens || !tokens.token || !tokens.refresh_token) {
      self.setState({loading:false});
      Alert.alert("Lỗi", "Cập nhật lỗi.",[{text: "OK"}],{ cancelable: false });
      return;
    }

    const params = {};
    if(user_data && user_data.user) {
      for(let k in user_data.user) {
        params[k]=user_data.user[k];
      }
    }
    if(user_data && user_data.store) {
      for(let k in user_data.store) {
        params[k]=user_data.store[k];
      }
    }

    if(image && image.type && image.base64){
      params['image_base64'] = image.base64;
    }

    fetch(config.getLocation('user_detail/update_user/'), {
      headers: { 'authorization': tokens.token, },
      method: 'POST',body: parseForm(params),
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
        self.setState({loading:false});
      } else {
        let user = null;
        let store = null;
        if(user_data && user_data.user) {user=new UserObj();user.mapobj(user_data.user);}
        if(user_data && user_data.store) {
          store=new StoreObj();store.mapobj(json.store);
        }
        const data_save = {
          user: user?user.properties:null,
          store:store?store.properties:null,
          tokens:null
        };
        saveUser(realm, data_save);
        self.initUser(realm);
        self.setState({loading:false,is_edit:false,update_location:false});
      }
    })
    .catch((error) => {
      console.log('e',error);
      self.setState({loading:false});
    });

    // console.log(user_data);
    // this.setState({is_edit:!is_edit});
  }
  onChangeText = (role,name,txt) => {
    const {user_data} = this.state;
    user_data[role][name]=txt;
    this.setState({user_data});
  }

  _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
        base64:true,
      });
      if (!result.cancelled) {
        this.setState({ image: result });
      }
    } catch (e) {console.log(e);}
  };

  changePassword=()=>{
    this.setState({change_pass:false,loading:true});
    const {tokens,old_password,password,password1} = this.state;
    const self = this;
    if(!old_password || !password || !password1) {
      Alert.alert("Lỗi", "Không được để trống",[{text: "OK"}],{ cancelable: false });
      self.setState({loading:false});
      return;
    }
    if(password != password1) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp",[{text: "OK"}],{ cancelable: false });
      self.setState({loading:false});
      return;
    }

    const time = Math.floor(new Date()/1000);
    const hold_password = crypt_lib.hash(old_password);
    const hpassword = crypt_lib.hash(password, time);
    const old_data = crypt_lib.encrypt(config.encryption_key, hold_password);
    const data = crypt_lib.encrypt(config.encryption_key, hpassword, old_data.crypt_data);
    
    const params = {
      old_password: old_data.ciphertext,
      password: data.ciphertext,
      salt : old_data.salt,
      iv : old_data.iv,
      time : time,
    };

    fetch(config.getLocation('auth/change_password/'), {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': "application/json",
        'authorization': tokens.token,
      },
      method: 'POST',
      body: parseForm(params),
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      self.setState({loading:false});
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        saveToken(self.props.realm, json);
        Alert.alert("Thông báo", "Đổi mật khẩu thành công.",
          [{text: "OK"}],{ cancelable: false }
        );
      }
    })
    .catch((error) => {
      self.setState({loading:false});
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  render() {
    const {navigation} = this.props;
    const {
      locations,enable_gps,user_list,is_edit,update_location,user_data,loading,tokens,image,change_pass,
      old_password,password,password1
    } = this.state;

    return (
      <ScrollView>
        <Overlay isVisible={loading} borderRadius={8} height="auto">
            <Text style={{alignItems:'center',textAlign:'center'}}>Đang cập nhật...</Text>
        </Overlay>
        <Overlay isVisible={change_pass} borderRadius={8} height="auto">
          <View>
            <Text style={{textAlign:'center',fontWeight:"bold",fontSize:20,color:"#fb5b5a",marginBottom:20}}>
              ĐỔI MẬT KHẨU
            </Text>
            <View style={[styles.roundInput,styles.mb5]} >
              <TextInput secureTextEntry
                style={styles.input50}
                placeholder="Mật khẩu cũ" 
                placeholderTextColor="#ffffff"
                value={this.state.old_password}
                onChangeText={text => this.setState({old_password:text}) }/>
            </View>
            <View style={[styles.roundInput,styles.mb5]} >
              <TextInput secureTextEntry
                style={styles.input50}
                placeholder="Mật khẩu mới" 
                placeholderTextColor="#ffffff"
                value={this.state.password}
                onChangeText={text => this.setState({password:text}) }/>
            </View>
            <View style={[styles.roundInput,styles.mb5]} >
              <TextInput secureTextEntry
                style={styles.input50}
                placeholder="Nhập lại mật khẩu mới" 
                placeholderTextColor="#ffffff"
                value={this.state.password1}
                onChangeText={text => this.setState({password1:text}) }/>
            </View>
            <View style={{textAlign:'center',alignItems:'center',marginTop:20}}>
              <TouchableOpacity onPress={()=>this.changePassword()}
                style={[styles.roundBtn,styles.bgsuccess,styles.w100p]}>
                <Text style={styles.white}>Đổi</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>this.setState({change_pass:!change_pass})}
                style={[styles.roundBtn,styles.bgred,styles.w100p]}>
                <Text style={styles.white}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <View style={{paddingTop: 5,}}>
          { (tokens && tokens.refresh_token && user_data && user_data.store?true:false) &&
            <Image
              resizeMode='contain'
              source={{ uri: image?image.uri:config.getImage(user_data.store['img_url']) }}
              containerStyle={{height:300}}
              PlaceholderContent={
                <View style={{
                  height:'100%',width:'100%', backgroundColor:'#bf9f94',
                  justifyContent:'center',alignItems:'center'
                }}>
                  <Text style={{textAlign:'center'}}>Không có ảnh</Text>
                </View>
              }
            />
          }
          { user_list && user_list.user &&
          user_list.user.map((it, i) => (
                <ListItem
                  key={i}
                  title={it.label}
                  subtitle={
                    is_edit && it.name!='permission_id' ?
                    <Input
                    placeholder='Vui lòng điền...'
                    onChangeText={t=>this.onChangeText('user',it.name,t)}
                    value={user_data.user[it.name]}
                    />
                    :it.value
                  }
                  bottomDivider
                />
              ))
          }
          { user_list && user_list.store &&
          user_list.store.map((it, i) => (
                <ListItem
                  key={i}
                  title={it.label}
                  subtitle={
                    is_edit && it.name=='hide_detail'?
                    <CheckBox
                      title='Ẩn/Hiện'
                      checked={user_data.store.hide_detail?true:false}
                      onPress={() => {
                        user_data.store.hide_detail=user_data.store.hide_detail?0:1;
                        this.setState({user_data});
                      } }
                    />
                    : is_edit && it.name=='img_url'?
                      <View style={{flex: 1, flexDirection: 'row',justifyContent: 'space-between',}}>
                          <Icon name='image' size={30} color='#000'onPress={this._pickImage}/>
                          <Text>{
                            (image &&image.type)?image.uri.split('/').pop()
                            :it.value?it.value:''
                          }</Text>
                          <Icon name='remove' size={30} color='#000' onPress={()=>this.setState({image:null})}
                          />
                      </View>
                    : is_edit && it.name!='location' ?
                      <Input
                      placeholder='Vui lòng điền...'
                      onChangeText={t=>this.onChangeText('store',it.name,t)}
                      value={user_data.store[it.name]}
                      />
                    : it.value
                  }
                  rightIcon={it.name=='location' && update_location?{name:'check',color:'#4caf50'}:null}
                  badge={it.name=='location'?{
                    value:'Cập nhật',
                    status:"success",
                    onPress:()=>this.enableGPS()
                  }:null}
                  bottomDivider
                />
              ))
          }

          <View style={{marginTop:40, marginHorizontal:'2%'}}>
            {is_edit &&
            <TouchableOpacity onPress={this.updateProfile}
              style={[styles.roundBtn,styles.bginfo,styles.w100p]}>
              <Text style={styles.white}>Cập nhật</Text>
            </TouchableOpacity>
            }
            {((tokens && tokens.refresh_token && user_data && user_data.user)?true:false) &&
            <View>
              <TouchableOpacity onPress={()=>this.setState({is_edit:!is_edit})}
                style={[styles.roundBtn,styles.bginfo,styles.w100p]}>
                <Text style={styles.white}>{is_edit?'Đóng':'Sửa thông tin'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>this.setState({change_pass:!change_pass})}
                style={[styles.roundBtn,styles.bginfo,styles.w100p]}>
                <Text style={styles.white}>Đổi mật khẩu</Text>
              </TouchableOpacity>
            </View>
            }
            <TouchableOpacity onPress={this.props.logout}
              style={[styles.roundBtn,styles.bginfo,styles.w100p]}>
              <Text style={styles.white}>Đăng Xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
}

export default DetailTab;