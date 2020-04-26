import Geolocation from '@react-native-community/geolocation';

import React from 'react';
import {View,Text,ScrollView,Alert} from 'react-native';
import {Overlay,Button,ListItem,Input,CheckBox} from 'react-native-elements';

import config from '../../config.js';
import { getUser,getToken,saveUser } from '../../models/model_utils.js';
import { parseForm } from '../../utils.js';
import { UserObj,StoreObj,UserLabel,StoreLabel,ROLE_NAME } from '../../models/models.js';

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


class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      locations: null,
      update_location:false,
      enable_gps: false,
      user_data:null,
      loading:false,
      user_list:null,
      is_edit:false,
    };
  }

  componentDidMount() {
    this.initUser(this.props.realm);
    this.setState({update_location:false});
    // this.enableGPS();
  }

  initUser = (realm) => {
    const user_data = getUser(realm);
    this.mapUserList(user_data);
  }

  mapUserList = (user_data='') => {
    // console.log('user_data?',user_data);
    const user_list = {user:[],store:[],};

    const user = UserObj;
    if(user_data.user){
      user.mapobj(user_data.user);
      for (let i in user.properties) {
        if (i!='id') {
          const obj = {
            name:i,
            label:UserLabel.properties[i],
          };
          if(i=='permission_id') {
            obj.value = ROLE_NAME[user.properties[i]];
          } else {
            obj.value = user.properties[i];
          }
          user_list.user.push(obj);
        }
      }
    }

    const store = StoreObj;
    store.mapobj(user_data.store);
    if(user_data.store && user_data.user){
      for (let i in store.properties) {
        if (i!='id') {
          const obj = {
            name:i,
            label:StoreLabel.properties[i],
          };
          if(i=='hide_detail') {console.log('hide_detail',store.properties[i]);
            obj.value = store.properties[i]==1?'Đã ẩn':'Hiện';
          } else {
            obj.value = store.properties[i];
          }
          user_list.store.push(obj);
        }
      }
    } else if(user_list.store){
      user_list.store.push({
        name:'location',
        label:StoreLabel.properties['location'],
        value:store.properties['location'],
      });
    }

    this.setState({user_data:{user:user_data.user?user.properties:null,store:user_data.store?store.properties:null}});
    this.setState({user_list});
    // console.log('detail.js:2',user_list);
  }

  enableGPS = () => {
    const self = this;
    Geolocation.getCurrentPosition(
      function(locations) {
        // console.log('a',locations);
        const {user_data} = self.state;
        user_data.store.location = locations.coords.latitude+';'+locations.coords.longitude;
        self.mapUserList(user_data);
        self.setState({enable_gps:true,update_location:true});
      },
      function(error) {
        Alert.alert("Lỗi", error.message,[{text: "OK"}],{ cancelable: false });
        console.log('a',error);
        self.setState({enable_gps:false});
      },
    );
  }

  editProfile = () => {
    const {is_edit} = this.state;
    this.setState({is_edit:!is_edit});
  }
  updateProfile = () => {
    this.setState({loading:true});
    const {realm} = this.props;
    const {user_data} = this.state;
    const self = this;

    const token = getToken(realm);
    if(!token || !token.token) {
      self.setState({loading:false});
      Alert.alert("Lỗi", "Cập nhật lỗi.",[{text: "OK"}],{ cancelable: false });
      return;
    }

    const params = {};
    if(user_data && user_data.user) {
      for(k in user_data.user) {
        params[k]=user_data.user[k];
      }
    }
    if(user_data && user_data.store) {
      for(k in user_data.store) {
        params[k]=user_data.store[k];
      }
    }

    fetch(config.getLocation('userdetail/update_user/'), {
      headers: { 'authorization': token.token, },
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
        if(user_data && user_data.user) {  user=UserObj;user.mapobj(user_data.user); }
        if(user_data && user_data.store) {  store=StoreObj;store.mapobj(user_data.store); }
        const data_save = {
          user: user?user.properties:null,
          store:store?store.properties:null,
          tokens:null
        };
        console.log('detail.js:4b',data_save);
        saveUser(realm, data_save);
        self.initUser(realm);
        self.setState({loading:false,is_edit:false});
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

  render() {
    const {navigation} = this.props;
    const {locations,enable_gps,user_list,is_edit,update_location,user_data,loading} = this.state;

    return (
      <ScrollView>
        <Overlay isVisible={loading} borderRadius={8} height="auto">
            <Text style={{alignItems:'center',textAlign:'center'}}>Loadding...</Text>
        </Overlay>
        <View style={{paddingTop: 5,}}>
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

          {is_edit &&
          <Button
            title={'Cập nhật'}
            onPress={this.updateProfile}
            containerStyle={{
              marginHorizontal: '5%',
              marginBottom: 2,
              marginTop: 8,
              backgroundColor: 'red'
            }}
          />
          }
          {user_data && user_data.user &&
          <Button
            title={is_edit?'Đóng':'Sửa thông tin'}
            onPress={this.editProfile}
            containerStyle={{
              marginHorizontal: '5%',
              marginBottom: 2,
              marginTop: 2,
              backgroundColor: 'red'
            }}
          />
          }
          <Button title="Logout" onPress={this.props.logout}
            containerStyle={{margin: 2, marginBottom:8, marginHorizontal: '5%',}}
          />
        </View>
      </ScrollView>
    );
  }
}

export default Detail;