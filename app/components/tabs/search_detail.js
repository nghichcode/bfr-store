import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, FlatList, Alert, Dimensions} from 'react-native';
import {Image, Card} from 'react-native-elements';

import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

import config from '../../config.js';
import {crd2m} from '../../utils.js';
import {styles} from '../styles/round_theme.js';
import {parseDate, parseForm} from "../../utils";

const imgWidth = Math.floor(Dimensions.get('window').width/2 - 33);
const imgHeight = Math.floor(imgWidth*4/3);

class DetailCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {store_list:[],};
  }
  componentDidMount() {
  	const self = this;
    const item = Object.assign({},self.props.item);
  	if(!item.store_id){return;}

    const params = {
      limit: 20,offset : 0,store_search:1,store_id:item.store_id,search : '',
    };

    fetch(config.getLocation('search/search_store_product/'), {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': "application/json",
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
        self.setState({store_list:json.store_products.data});
      }
    })
    .catch((error) => {
      Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
    });
  }

  handleSelectItem = (item)=>{
    this.refs.detail_scroll.scrollTo({x: 0, y: 0, animated: true});
    this.props.handleSelectItem(item);
    this.refs.detail_scroll.scrollTo({x: 0, y: 0, animated: true});
  }

  render() {
    const {handleSelectItem} = this;
    const {store_list} = this.state;
    const {backPress,item, store, showStore, user_location} = this.props;
    let suggest_list = this.props.suggest_list.filter((it)=> JSON.stringify(it)!==JSON.stringify(item) );
    for(let k in item) { if(item[k]=='null') delete item[k];}
    const hasContact = item.city || item.street_address_one || item.street_address_two
     || item.street_address_three || item.email || item.phone;
    return (
    <View style={{height:'100%'}}>
      <View style={styles.header_container}>
        <View style={styles.header_bar}>
          <TouchableOpacity onPress={ ()=>backPress() }>
            <Text style={[styles.white,styles.w40]}>
              <Ionicons name='md-arrow-back' size={30} color='#fff'/>
            </Text>
          </TouchableOpacity>
          <Text style={[styles.white,styles.header_title]}>Thông tin chi tiết</Text>
          <Text></Text>
        </View>
      </View>
      <ScrollView ref='detail_scroll'>
        <Card
          title={item.product_name}
          image={{uri: config.getImage(item.img_url)}}
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

            {item.store_id &&
            <View>
              <View style={{marginBottom:10}}>
                <Text style={styles.text20c}>Thông tin cửa hàng</Text>
              </View>
              <View style={styles.cards_list}>
                <View style={styles.card_row}>
                  <TouchableOpacity style={styles.card} activeOpacity={0.68}
                    onPress={()=>{showStore(item);}}
                  >
                    <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                      {(!(store && store.storename)) &&
                      <Icon name='info-circle' size={20} color='#ffffff'
                        style={{position:'absolute',top:0,right:0}}
                      />
                      }
                      <Icon name='home' size={20} color='#ffffff'/>
                      <Text style={{color:'#ffffff',marginLeft:4}}>
                        {item.storename}
                      </Text>
                    </View>
                    <Text style={{textAlign:'center',color:'#ffffff'}}>Tên cửa hàng</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex:1,flexDirection:'row',}}>
                  <View style={styles.card_row}>
                    <View style={styles.card}>
                      <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                        <Icon name='table' size={20} color='#ffffff'/>
                        <Text style={{color:'#ffffff',marginLeft:4}}>{item.quantity}</Text>
                      </View>
                      <Text style={{textAlign:'center',color:'#ffffff'}}>Số lượng</Text>
                    </View>
                  </View>
                  <View style={styles.card_row}>
                    <View style={styles.card}>
                      <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                        <Ionicons name='ios-timer' size={20} color='#ffffff'/>
                        <Text style={{color:'#ffffff',marginLeft:4}}>{
                          (item.exp && item.exp.length>10)?parseDate(item.exp.slice(0,10)):product.exp
                        }</Text>
                      </View>
                      <Text style={{textAlign:'center',color:'#ffffff'}}>Ngày hết hạn</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            }

            <View style={{marginBottom:10}}>
              <Text style={styles.text20c}>Thông tin sản phẩm</Text>
            </View>
            <View style={styles.cards_list}>
              <View style={{flex:1,flexDirection:'row',}}>
                <View style={styles.card_row}>
                  <View style={styles.card}>
                    <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                      <Icon name='dollar' size={20} color='#ffffff'/>
                      <Text style={{color:'#ffffff',marginLeft:4}}>{item.price}</Text>
                    </View>
                    <Text style={{textAlign:'center',color:'#ffffff'}}>Giá</Text>
                  </View>
                </View>
                <View style={styles.card_row}>
                  <View style={styles.card}>
                    {item.store_id &&
                    <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                      <Icon name='road' size={20} color='#ffffff'/>
                      <Text style={{color:'#ffffff',marginLeft:4}}>{
                        !user_location
                        ?'Không rõ'
                        :item.location
                          ?crd2m(user_location, item.location)+'m'
                          :'Không rõ'
                      }</Text>
                    </View>
                    }
                    {!item.store_id &&
                    <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                      <Icon name='shield' size={20} color='#ffffff'/>
                      <Text style={{color:'#ffffff',marginLeft:4}}>Sản phẩm gốc</Text>
                    </View>
                    }
                    <Text style={{textAlign:'center',color:'#ffffff'}}>{item.store_id?'Khoảng cách':''}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.card_row}>
                <View style={styles.card}>
                  <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                    <Icon name='barcode' size={20} color='#ffffff'/>
                    <Text style={{color:'#ffffff',marginLeft:4}}>{item.gtin_code}</Text>
                  </View>
                  <Text style={{textAlign:'center',color:'#ffffff'}}>Barcode</Text>
                </View>
              </View>
            </View>

            <View style={styles.cards_list}>
              <View style={styles.card_row}>
                <View style={styles.card}>
                    <Text style={[styles.white,styles.textBold]}>Mô tả:</Text>
                    <Text style={styles.white}>{item.description}</Text>
                </View>
              </View>
              <View style={styles.card_row}>
                <View style={styles.card}>
                  <Text style={[styles.white,styles.textBold]}>Nơi sản xuất:</Text>
                  <Text style={styles.white}>{item.party_name}</Text>
                </View>
              </View>
            </View>

            {hasContact &&
            <View>
              <View style={{marginBottom:10}}>
                <Text style={styles.text20c}>Thông tin liên hệ</Text>
              </View>
              <View style={styles.cards_list}>
                <View style={styles.card_row}>
                  <View style={styles.card}>
                    {item.city && <View>
                      <Text style={[styles.white,styles.textBold]}>Thành phố:</Text>
                      <Text style={styles.white}>{item.city}</Text>
                    </View>}
                    {item.street_address_one && <View>
                      <Text style={[styles.white,styles.textBold]}>Địa chỉ sản xuất 1:</Text>
                      <Text style={styles.white}>{item.street_address_one}</Text>
                    </View>}
                    {item.street_address_two && <View>
                      <Text style={[styles.white,styles.textBold]}>Địa chỉ sản xuất 2:</Text>
                      <Text style={styles.white}>{item.street_address_two}</Text>
                    </View>}
                    {item.street_address_three && <View>
                      <Text style={[styles.white,styles.textBold]}>Địa chỉ sản xuất 3:</Text>
                      <Text style={styles.white}>{item.street_address_three}</Text>
                    </View>}
                    {item.email && <View>
                      <Text style={[styles.white,styles.textBold]}>Email:</Text>
                      <Text style={styles.white}>{item.email}</Text>
                    </View>}
                    {item.phone && <View>
                      <Text style={[styles.white,styles.textBold]}>Số điện thoại:</Text>
                      <Text style={styles.white}>{item.phone}</Text>
                    </View>}
                  </View>
                </View>
              </View>
            </View>
            }

            {suggest_list.length > 0 &&
            <View style={{marginBottom: 10}}>
              <Text style={styles.text20c}>Sản phẩm liên quan</Text>
              <View style={{marginVertical:10}}>
                <FlatList
                  ItemSeparatorComponent={()=><View style={{width:8,backgroundColor:'#fff'}}/>}
                  keyExtractor={(item, index) => index.toString()} horizontal={true}
                  data={suggest_list}
                  renderItem={({item, index}) => (
                    <TouchableOpacity onPress={()=>handleSelectItem(item)} >
                    <View style={{ width: imgWidth-8, marginBottom:10}}>
                      <Image source={{ uri: config.getImage(item.img_url) }} style={{ width: imgWidth-8, height: imgHeight }} />
                      <View style={{flexDirection: 'row',justifyContent:'space-between',marginTop:10}}>
                        <Text style={[styles.white, styles.bgred, styles.badge_txt]}>
                          {(
                            !user_location
                              ? ((item.store_id) ? 'Không rõ' : 'SP gốc') : item.location
                              ? crd2m(user_location, item.location) + 'm' : item.store_id ? 'Không rõ' : 'SP gốc'
                          )}
                        </Text>
                        <Text style={{marginEnd:4}}>
                          {item.is_approved > 0 && <Icon name='check' size={10} color='tomato'/>}
                          {item.is_trusted > 0 && <Icon name='star' size={10} color='tomato'/>}
                        </Text>
                      </View>
                      <Text>{item.product_name}</Text>
                      <Text style={{color: '#9e9e9e'}}>{item.gtin_code}</Text>
                      <Text style={{color: '#9e9e9e'}}>Giá: {item.price}</Text>
                    </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
            }

            {store_list.length > 0 &&
            <View style={{marginBottom: 10}}>
              <Text style={styles.text20c}>Sản phẩm khác của cửa hàng</Text>
              <View>
                <FlatList
                  keyExtractor={(item, index) => index.toString()} horizontal={true}
                  data={store_list}
                  renderItem={({item, index}) => (
                    <TouchableOpacity onPress={()=>handleSelectItem(item)} >
                    <View style={{ width: imgWidth-8, marginBottom:10}}>
                      <Image source={{ uri: config.getImage(item.img_url) }} style={{ width: imgWidth-8, height: imgHeight }} />
                      <View style={{flexDirection: 'row',justifyContent:'space-between',marginTop:10}}>
                        <Text style={[styles.white, styles.bgred, styles.badge_txt]}>
                          {(
                            !user_location
                              ? ((item.store_id) ? 'Không rõ' : 'SP gốc') : item.location
                              ? crd2m(user_location, item.location) + 'm' : item.store_id ? 'Không rõ' : 'SP gốc'
                          )}
                        </Text>
                        <Text style={{marginEnd:4}}>
                          {item.is_approved > 0 && <Icon name='check' size={10} color='tomato'/>}
                          {item.is_trusted > 0 && <Icon name='star' size={10} color='tomato'/>}
                        </Text>
                      </View>
                      <Text>{item.product_name}</Text>
                      <Text style={{color: '#9e9e9e'}}>{item.gtin_code}</Text>
                      <Text style={{color: '#9e9e9e'}}>Giá: {item.price}</Text>
                    </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
            }

          </View>
        </Card>
      </ScrollView>
      {this.props.children}
    </View>
    );
  }
}

export default DetailCard;