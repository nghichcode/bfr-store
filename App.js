import React from 'react';
import { View, Text, Alert } from 'react-native';
const Realm = require('realm');

import Login from './app/components/login.js';
import Home from './app/components/home.js';

import {TokenSchema,UserSchema,StoreSchema} from './app/models/models.js';
import { getToken } from './app/models/model_utils.js';
import config from './app/config.js';

// SWITCH LOGIN <> HOME : DEBUG
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      realm: null,
      loading:true,
      is_login: false,
    };
  }

  componentDidMount() {
    Realm.open({schema: [TokenSchema,UserSchema,StoreSchema],schemaVersion: config.schemaVersion})
    .then(realm => {
      this.setState({ realm });
      // realm.write(() => {realm.delete(realm.objects(TokenSchema.name));});
      // realm.write(() => {realm.delete(realm.objects(UserSchema.name));});
      // realm.write(() => {realm.delete(realm.objects(StoreSchema.name));});
      // console.log('MOUNT',realm.objects(TokenSchema.name));

      const token = getToken(realm);
      if( !token || (!token.token && !token.refresh_token) ) {
        this.setState({loading:false, is_login:false});
        return;
      }
      if(token && token.token && !token.refresh_token) {
        this.setState({loading:false, is_login:true});
        return;
      }

      fetch(config.getLocation('auth/validate/'), {
        headers: { 'authorization': token.token, },
        method: 'POST',body: '',
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if(json.error) {
          this.setState({loading:false, is_login:false});
        } else {
        this.setState({loading:false, is_login:true});
        }
      })
      .catch((error) => {
        console.log('e',error);
        this.setState({loading:false, is_login:false});
      });

    })
    .catch(error => {
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }
  componentWillUnmount() {
    const {realm} = this.state;
    if (realm !== null && !realm.isClosed) {
      realm.close();
    }
  }

  setLogin = (is_login) => {
    this.setState({is_login});
  }
  render() {
    const {realm,loading,is_login} = this.state;
    if (loading) {
      return(
        <View style={{flex: 1, flexDirection: 'column',justifyContent: 'center',}}>
            <Text style={{fontWeight:"bold",fontSize:40,color:"#fb5b5a",textAlign:'center'}}>Loading...</Text>
        </View>
      );
    }
    if (is_login) {
      return (
        <Home setLogin={this.setLogin} realm={realm} />
      );
    }
    return (
      <Login setLogin={this.setLogin} realm={realm} />
    );
  }
}


export default App;
