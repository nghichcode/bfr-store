import 'react-native-gesture-handler';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  // Button
} from 'react-native';
import {Button, SearchBar, ListItem, Divider} from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    };
  }

  updateSearch = search => {
  	// console.log(1);
    this.setState({search});
  };

  render() {
    const {search} = this.state;
    const {navigation} = this.props;
    return (
      <View>
        <SearchBarATC onChangeText={this.updateSearch} />
        {search==='' &&
        (<View><View style={{
          backgroundColor: '#CCC',
          paddingHorizontal: '2%',
          paddingTop: 5,
        }}>
        	<Text>Abc</Text>
        </View>
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
            onPress={() => navigation.navigate('Nest', {name: 'Jane'})}
            style={{margin: 2, width: '80%'}}
          />
          <View style={{margin: 2}}>
            <Text>
              <Ionicons name='ios-football' size={20} color='#CFC'/>
            </Text>
            <Text>
              {this.state.search}
            </Text>
          </View>
        </View></View>)}
      </View>
    );
  }
}

class Profile extends React.Component {
  render() {
    const {navigation} = this.props;
    return (
      <Button
        title="Go to Jane's home"
        onPress={() => navigation.navigate('Nest', {name: 'Jane'})}
      />
    );
  }
}

class Feed extends React.Component {
  render() {
    const {navigation} = this.props;
    return (
      <View>
        <Text>Feed</Text>
      </View>
    );
  }
}

class Messages extends React.Component {
  render() {
    const {navigation} = this.props;
    return (
      <View>
        <Text>Messages</Text>
      </View>
    );
  }
}


function Nest() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Feed') {
            iconName = focused
              ? 'ios-information-circle'
              : 'ios-information-circle-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'ios-list-box' : 'ios-list';
          }
          return <Ionicons name={iconName} size={size} color={color}/>;
        },
      })}

      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Feed" component={Feed}/>
      <Tab.Screen name="Messages" component={Messages}/>
    </Tab.Navigator>
  );
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
			    distance: 100,
			  },
			  {
			    name: 'Amy Farha Farha Farha Farha Farha',
			    img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
			    store_name: 'Vice President President President President',
			    distance: 100,
			  },
			  {
			    name: 'Chris Jackson',
			    img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
			    store_name: 'Vice Chairman',
			    distance: 200,
			  },
			  {
			    name: 'Amy Farha Farha Farha Farha Farha',
			    img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
			    store_name: 'Vice President President President President',
			    distance: 100,
			  },
			  {
			    name: 'Chris Jackson',
			    img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
			    store_name: 'Vice Chairman',
			    distance: 200,
			  },
			  {
			    name: 'Amy Farha Farha Farha Farha Farha',
			    img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
			    store_name: 'Vice President President President President',
			    distance: 100,
			  },
			  {
			    name: 'Chris Jackson',
			    img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
			    store_name: 'Vice Chairman',
			    distance: 200,
			  },
			  {
			    name: 'Kama Jackson',
			    img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
			    store_name: 'Kamara',
			    distance: 300,
			  },
			  {
			    name: 'Amy Farha Farha Farha Farha Farha',
			    img_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
			    store_name: 'Vice President CC',
			    distance: 100,
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
    <View style={{backgroundColor: '#fff', flex:0}}>
    	<View>
	      <View style={{width: '90%'}}>
	        <SearchBar
	          lightTheme={true}
	          placeholder="Type Here..."
	          containerStyle={{backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,borderBottomColor: '#ddd',borderTopColor: '#ddd',}}
	          inputContainerStyle={{backgroundColor: '#eee'}}
	          onChangeText={this.onChangeText}
	          value={search}
	        />
	      </View>
	      <View style={{
	        position: 'absolute',
	        right: 0, top: 0, width: '10%', height: '100%',
	        flex: 1,flexDirection: 'row',justifyContent: 'center',alignItems: 'center',
	        backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,borderBottomColor: '#ddd',borderTopColor: '#ddd',
	      }}>
	        <Button
	          title=""
	          onPress={() => {console.log(123);}}
						icon={<Icon name='qrcode' size={40} color='#000'/>}
						type="clear"
						buttonStyle={{padding:0, margin:0,marginRight:3}}
	        />
	      </View>
      </View>
      { !this.state.isEmpty &&
      (
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
					    badge={{ value: '300.0000', status: "error" }}
					    bottomDivider
					    chevron
					    onPress={() => {console.log(item.name);}}
					  />
					)}
		    />
      )
      }
    </View>
		);
	}
}
// <Text style={{marginRight:2}}>
	// <Icon name='qrcode' size={40} color='#000'/>
// </Text>

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    };
  }

  updateSearch = search => {
    this.setState({search});
  };

  render() {
  	// const {search} = this.state;
  	// const updateSearch = this.updateSearch;
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              title: 'Welcome', headerShown: true,
              header: ({scene, previous, navigation}) => {
                return (
                	<View/>
                );
              },
            }}
          />
          <Stack.Screen name="Profile" component={Profile}
                        options={{
                          title: 'Welcome', headerStyle: {backgroundColor: '#ff5722'},
                          headerTitleStyle: {color: '#fcfcfc'},
                          headerTintColor: '#fcfcfc',
                          headerRight: () => (
                            <Button
                              onPress={() => alert('This is a button!')}
                              title="Info"
                              color="#fff"
                            />
                          ),
                        }}
          />
          <Stack.Screen name="Nest" component={Nest}/>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}


export default App;
