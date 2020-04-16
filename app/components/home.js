import 'react-native-gesture-handler';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import React from 'react';
import {View,Text,FlatList,Alert,StatusBar,TouchableOpacity} from 'react-native';
import {Button, SearchBar, ListItem, Divider, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

const Realm = require('realm');

import {TokenSchema} from '../models/models.js';
import config from '../config.js';

const Tab = createBottomTabNavigator();

class Feed extends React.Component {
  render() {
    const {navigation} = this.props;
    return (
      <View><Text>Feed</Text></View>
    );
  }
}
class Messages extends React.Component {
  render() {
    const {navigation} = this.props;
    return (
      <View><Text>Messages</Text></View>
    );
  }
}

class SearchTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      realm: null,
    };
  }

  updateSearch = search => {
    this.setState({search});
  };

  render() {
    const {search} = this.state;

    return (
      <View>
        <StatusBar backgroundColor="#ff9800" />
        <SearchBarATC onChangeText={this.updateSearch} />
        {search==='' &&
        (<View>
          <View style={{paddingTop: 5,}}>
            <Button
              title="Go to Jane's profile"
              onPress={() => navigation.navigate('Profile', {name: 'Jane'})}
              containerStyle={{
                marginHorizontal: '10%',
                marginBottom: 2,
                width: '80%',
                backgroundColor: 'red'
              }}
            />
            <Button
              title="Nest"
              onPress={() => navigation.navigate('Home', {name: 'Jane'})}
              containerStyle={{margin: 2, width: '80%',marginHorizontal: '10%',}}
            />
            <Button title="Logout" onPress={this.props.logout}
              containerStyle={{margin: 2, width: '80%',marginHorizontal: '10%',}}
            />
          </View>
        </View>)}
      </View>
    );
  }
}

class SearchBarATC extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      isEmpty: true,
      list: [
        {
          name: 'Amy Farha Farha Farha Farha Farha',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
          store_name: 'Vice President President President President',
          distance: 10,
        },
        {
          name: 'Amy Farha Farha Farha Farha Farha',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
          store_name: 'Vice President President President President',
          distance: 20,
        },
        {
          name: 'Chris Jackson',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
          store_name: 'Vice Chairman',
          distance: 30,
        },
        {
          name: 'Amy Farha Farha Farha Farha Farha',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
          store_name: 'Vice President President President President',
          distance: 40,
        },
        {
          name: 'Chris Jackson',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
          store_name: 'Vice Chairman',
          distance: 50,
        },
        {
          name: 'Amy Farha Farha Farha Farha Farha',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
          store_name: 'Vice President President President President',
          distance: 60,
        },
        {
          name: 'Chris Jackson',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
          store_name: 'Vice Chairman',
          distance: 70,
        },
        {
          name: 'Kama Jackson',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
          store_name: 'Kamara',
          distance: 80,
        },
        {
          name: 'Amy Farha Farha Farha Farha Farha',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
          store_name: 'Vice President CC',
          distance: 90,
        },
        {
          name: 'Amy Farha Farha Farha Farha Farha',
          img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
          store_name: 'Vice President CC',
          distance: 100,
        },
      ],

    };
  }

  onChangeText = text => {
    this.props.onChangeText(text);
    this.setState({isEmpty: text === '',search: text});
  };

  render() {
    const {search} = this.state;
    return (
    <View style={{backgroundColor: '#ffa', height:'100%'}}>
      <View style={{backgroundColor: '#ffc',height: 60}}>
        <View style={{width: '90%'}}>
          <SearchBar
            lightTheme={true}
            placeholder="Type Here..."
            containerStyle={{backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,borderBottomColor: '#ddd',borderTopColor: '#ddd',}}
            inputContainerStyle={{backgroundColor: '#eee',height:'100%'}}
            onChangeText={this.onChangeText}
            value={search}
          />
        </View>
        <View style={{
          position: 'absolute',right: 0, top: 0, width: '10%', height: '100%',
          flex: 1,flexDirection: 'row',justifyContent: 'center',alignItems: 'center',
          backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,borderBottomColor: '#ddd',borderTopColor: '#ddd',
        }}>
          <Button
            title="" onPress={() => {console.log(123);}}
            icon={<Icon name='qrcode' size={40} color='#000'/>}
            type="clear"
            buttonStyle={{padding:0, margin:0,marginRight:6,height:'100%'}}
          />
        </View>
      </View>
      { !this.state.isEmpty &&
      (
        <View style={{position:'absolute',top:60,left:0,right:0,bottom:0}}>
        <FlatList
          initialNumToRender={this.state.list.length}
          keyExtractor={(item, index) => index.toString()}
          data={this.state.list}
          renderItem={({ item, index }) => (
            <ListItem
              title={this.state.search}
              rightTitle={<Text><Icon name='check' size={10} color='tomato'/><Icon name='star' size={10} color='tomato'/></Text>}
              subtitle={item.store_name}
              rightSubtitle={this.state.list.length+'m'}
              leftAvatar={{ source: { uri: item.img_url } }}
              badge={{ value: item.distance, status: "error" }}
              bottomDivider
              chevron
              onPress={() => {console.log(item.name);}}
            />
          )}
        />
        </View>
      )
      }
    </View>
    );
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      realm: null,
    };
  }

  componentDidMount() {
    Realm.open({schema: [TokenSchema],schemaVersion: config.schemaVersion})
    .then(realm => {
      this.setState({ realm });
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

  tabs_data = {
    tabs: {
      admin:{name:'Admin', icon:'user'},
      store:{name:'Cửa Hàng', icon:'home'},
      search:{name:'Tìm Kiếm', icon:'search'},
      detail:{name:'Thông Tin', icon:'address-card'},
    },
    getIconByName: function(name, dicon='') {
      const tabs = this.tabs;
      for(t in tabs){if(name===tabs[t].name) return tabs[t].icon;}
      return dicon || 'home';
    }
  }

  logout = () => {
    const {realm} = this.state;
    realm.write(() => {realm.delete(realm.objects(TokenSchema.name));});
    this.props.navigation.navigate('Login');
  }

  render() {
    const {navigation} = this.props;
    return (
    <Tab.Navigator
      initialRouteName='Tìm Kiếm'
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName=this.tabs_data.tabs.getIconByName(route.name);
          return <Icon name={iconName} size={size} color={color}/>;
        },
      })}

      tabBarOptions={{
        activeTintColor: 'tomato',inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name={tabs.admin.name} component={Feed}/>
      <Tab.Screen name={tabs.store.name} component={Feed}/>
      <Tab.Screen name={tabs.search.name}>
      {props => <SearchTab {...props} logout={this.logout} navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name={tabs.detail.name} component={Feed}/>
    </Tab.Navigator>
    );
  }
}

export default Home;