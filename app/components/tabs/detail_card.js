import React from 'react';
import {View,Text,ScrollView,TouchableOpacity} from 'react-native';
import {Card} from 'react-native-elements';

import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

import config from '../../config.js';
import {crd2m} from '../../utils.js';
import {styles} from '../styles/round_theme.js';

class DetailCard extends React.Component {
  render() {
    const {item, store, showStore, user_location} = this.props;
    const hasContact = item.city && item.street_address_one && item.street_address_two
     && item.street_address_three && item.email && item.phone;
    return (
      <ScrollView style={{position:'absolute',top:60,left:0,right:0,bottom:0}}>
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
                          item.exp?item.exp:''
                        }</Text>
                      </View>
                      <Text style={{textAlign:'center',color:'#ffffff'}}>Ngày hết hạn</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            }

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

          </View>
        </Card>
      </ScrollView>
    );
  }
}

export default DetailCard;