import React from 'react';
import {ScrollView,Alert,View,Button,FlatList,TouchableOpacity} from 'react-native';
import {Card,Text,ListItem,Overlay,Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

import {styles} from './search.js';
import config from '../../config.js';
import {parseForm,parseDate,crd2m} from '../../utils.js';
import SearchBarATC from './search_bar_atc.js';
import {getUser} from '../../models/model_utils.js';
import {ROLE} from '../../models/models.js';

class StoreTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,is_scan:false,
      list: [],
      user:{},tokens:{},
      edit_item:{},show_timepicker:false,
    };
  }

  componentDidMount() {
  	const {user,tokens} = getUser(this.props.realm);
    this.setState({user,tokens});
  }

  fetchData = (search, fetchSuccess) => {
    const {tokens,user} = this.state;
  	const self = this;

    const params = {
      limit: 100,
      offset : 0,
      store_search:1,
      search : search,
    };

    fetch(config.getLocation('search/search_store_product/'), {
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
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        const list = fetchSuccess(json.store_products.data);
        self.setState({list});
        // console.log('store.js:63',list[0]);
      }
    })
    .catch((error) => {
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  editItem = (o) => {
    const {edit_item} = this.state;
    for (var k in o) { edit_item[k] = o[k]; }
    this.setState({edit_item});
  }

  updateItem = (is_update) => {
    const self = this;
    const {edit_item,tokens,list} = this.state;
    const old_exp = edit_item.exp;

    edit_item.exp = edit_item.exp?
      Math.floor(new Date(parseDate(edit_item.exp,false)).getTime()/1000):Math.floor(new Date()/1000);
    const params = {
      id: edit_item.store_product_id,remove : 0,
      price:edit_item.price,
      quantity:edit_item.quantity,
      exp:edit_item.exp,
    };
    if (!is_update) {params.remove=1;}

    fetch(config.getLocation('store/update_product/'), {
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
      if(json.error) {
        Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
      } else {
        let relist = list.filter((it)=>it.store_product_id!=edit_item.store_product_id);
        if(is_update && edit_item){
          edit_item.exp = old_exp;
          relist.push(edit_item);
        }
        self.setState({ list:relist,edit_item:{} });
      }
    })
    .catch((error) => {
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });

  }

  render() {
    const {route,navigation} = this.props;
    const {list,loading,tokens,is_scan,edit_item,user,show_timepicker} = this.state;
    let is_store = (tokens && tokens.refresh_token && user.permission_id==ROLE['user'])?true:false;

    if(!is_store) {//GUEST/ADMIN
      if(!route.params) {
        return(
          <View>
            <Text style={{textAlign:'center'}}>Không có thông tin</Text>
          </View>
        );
      }
      const {store,user,user_location} = route.params;
      const store_owner = user?(user.last_name + ' ' + user.first_name):'';
      return (
        <ScrollView>
          {(store && store.id ? true:false) &&
          <Card
            title={store.storename}
            image={{uri: config.getImage(store.img_url)}}
            imageProps={{
              resizeMode:'contain',
              containerStyle:{height:300},
              PlaceholderContent:(
                <View style={{
                  height:'100%',width:'100%', backgroundColor:'#bf9f94',
                  justifyContent:'center',alignItems:'center'
                }}>
                  <Text style={{textAlign:'center'}}>Không có ảnh</Text>
                </View>
              )
            }}
            containerStyle={{marginBottom:8}}
          >
            <View style={{marginHorizontal:8}}>

              <View style={styles.cards_list}>
                <View style={styles.card_row}>
                  <View style={styles.card}>
                    <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                      <Icon name='map-marker' size={20} color='#ffffff'/>
                      <Text style={{color:'#ffffff',marginLeft:8}}>{store.location}</Text>
                    </View>
                    <Text style={{textAlign:'center',color:'#ffffff'}}>Tọa độ</Text>
                  </View>
                </View>

                <View style={{flex:1,flexDirection:'row',}}>
                  <View style={styles.card_row}>
                    <View style={styles.card}>
                      <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                        <Icon name='road' size={20} color='#ffffff'/>
                        <Text style={{color:'#ffffff',marginLeft:8}}>{
                          !user_location
                          ?'Không rõ'
                          :store.location
                            ?crd2m(user_location, store.location)+'m'
                            :'Không rõ'
                        }</Text>
                      </View>
                      <Text style={{textAlign:'center',color:'#ffffff'}}>Khoảng cách</Text>
                    </View>
                  </View>
                  {(user && user.email?true:null) &&
                  <View style={styles.card_row}>
                    <View style={styles.card}>
                      <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                        <Icon name='envelope' size={20} color='#ffffff'/>
                        <Text style={{color:'#ffffff',marginLeft:8}}>{user.email}</Text>
                      </View>
                      <Text style={{textAlign:'center',color:'#ffffff'}}>Email</Text>
                    </View>
                  </View>
                  }
                </View>

                {(store_owner?true:null) &&
                <View style={styles.card_row}>
                  <View style={styles.card}>
                    <Text style={[styles.textWhite,styles.textBold]}>Chủ cửa hàng:</Text>
                    <Text style={styles.textWhite}>{store_owner}</Text>
                  </View>
                </View>
                }
                <View style={styles.card_row}>
                  <View style={styles.card}>
                    <Text style={[styles.textWhite,styles.textBold]}>Mô tả:</Text>
                    <Text style={styles.textWhite}>{store.description}</Text>
                  </View>
                </View>

              </View>

            </View>
          </Card>
          }
        </ScrollView>
      );
    }
    return (//STORE
    <View>
      <SearchBarATC
        fetchData={this.fetchData} resultData={(list) => {this.setState({list});}}
        get_all={true} reload={true}
        barcodeRecognized={(barcodes, is_scan)=>this.setState({is_scan})}
      >
        {list &&
        <FlatList
          initialNumToRender={list.length}
          keyExtractor={(item, index) => index.toString()}
          data={list}
          renderItem={({ item, index }) => (
            <ListItem
              title={item.product_name}
              rightTitle={
                <Text>
                  {item.is_approved>0 && <Icon name='check' size={10} color='tomato'/>}
                  {item.is_trusted>0 && <Icon name='star' size={10} color='tomato'/>}
                </Text>
              }
              subtitle={item.gtin_code}
              rightSubtitle={item.price}
              leftAvatar={{ source: { uri: config.getImage(item.img_url) } }}
              leftElement={
                <TouchableOpacity onPress={()=>{
                  item.exp = (item.exp && item.exp.length>10)?parseDate(item.exp.slice(0,10)):item.exp;
                  this.setState({edit_item: item });
                }}>
                <Icon name='edit' size={30} color='#4caf50' underlayColor='#8bc34a' raised={true}
                />
                </TouchableOpacity>
              }
              onPress={()=>{
                navigation.navigate('Tìm Kiếm',{product:item});
              }}
              bottomDivider
            />
          )}
        />
        }
      </SearchBarATC>

      <Overlay isVisible={(edit_item && edit_item.id)?true:false} fullScreen={true}>
        <ScrollView>
          <Text style={{textAlign:'center',fontWeight:"bold",fontSize:20,color:"#fb5b5a",marginBottom:20}}>
            Sửa sản phẩm
          </Text>
          <Input
            label="Giá" placeholder="12000"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={edit_item.price}
            onChangeText={text => this.editItem({price:text})}/>
          <Input
            label="Số lượng" placeholder="100"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={edit_item.quantity}
            onChangeText={text => this.editItem({quantity:text})}/>
          <Input
            label="Hạn sử dụng" placeholder="dd/mm/yyyy"
            labelStyle={styles.orange} containerStyle={styles.mb5}
            value={edit_item.exp}
            leftIcon={
              <Icon name='calendar' size={40} color='tomato' onPress={()=>this.setState({show_timepicker:true})} />
            }
            onChangeText={text => this.editItem({exp:text})}/>

          <View style={styles.center}>
            <TouchableOpacity onPress={()=>this.updateItem(true)} style={[
              styles.loginBtn,styles.mt40,styles.success,styles.w80p
              ]}>
              <Text style={styles.white}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>this.updateItem(false)}
              style={[styles.loginBtn,styles.bgred,styles.w80p]}>
              <Text style={styles.white}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({ edit_item: {} })}
              style={[styles.loginBtn,styles.bginfo,styles.w80p]}>
              <Text style={styles.white}>ĐÓNG</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Overlay>

      {show_timepicker && (
        <DateTimePicker
          timeZoneOffsetInMinutes={ (-1)*(new Date()).getTimezoneOffset() }
          value={
            (!edit_item || !edit_item.exp
              || new Date(parseDate(edit_item.exp, false))=='Invalid Date')
              ? new Date() : new Date(parseDate(edit_item.exp, false))
          }
          mode='date'
          display="default"
          is24Hour={true}
          onChange={
            (e,d)=>{
              this.setState({show_timepicker:false});
              if(d) { this.editItem({exp:parseDate(d)}); }
            }
          }
        />
      )}

      {loading &&
        <View style={{
          position:'absolute',top:0,left:0,backgroundColor:'#00000066',
          width:'100%',height:'100%',flex:1,justifyContent:'center',zIndex:10
        }}>
          <Text style={{
            textAlign:'center',backgroundColor:'#fff',borderRadius:10,
            marginHorizontal:10,paddingVertical:20,fontWeight:'bold',
          }}>Đang xử lý...</Text>
        </View>
      }

    </View>
    );
  }
}

export default StoreTab;