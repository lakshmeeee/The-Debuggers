import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View,TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { db } from './firebase';
import firebase from 'firebase/compat';
import * as Location from 'expo-location';

export default function App() {
    const Stack = createStackNavigator();
    function Init({navigation}){
    const [name,setName] = useState('')
        // this function passes the username to main component 
        const nav = () => {
            navigation.replace('main',{
                Collnam : name
            })
        }
        return (
            <View>
                <TextInput
                placeholder='enter Your Name'
                onChangeText={(e)=>{setName(e)}}
                value={name}
                />
                <TouchableOpacity onPress={nav} style={{marginTop:'15%'}}>
                    <Text>Enter</Text>
                </TouchableOpacity>
            </View>
        )
    }


function Main({route}){
  const {Collnam} = route.params // Collnam => username
  const [stepCount, setStepCount] = useState(0);
  const [count,setCount] = useState(0)  
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [SyncData,setSyncData] = useState([])
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);
   const [gdata, setgData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [gSyncData,setgSyncData] = useState([])
  const [gsubscription, setgSubscription] = useState(null);


  //below peice of code listen for changes in database, 
  // whenever there is a change this is executed and step-count is updated.
      useEffect(()=>{
        db.collection(Collnam.concat('count')).doc('count').onSnapshot((snap)=>{
          var c = snap.data()
          setStepCount(c.count)
        })
      },[])


  // this function ask for premissions to location access ,
  // if given it subscribes to the location, 
  // then the value is returned.
      const getloc = async() => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }


  // this function pushes the location data to database according to the current username
      const putloc = async() => {
        await db.collection(Collnam.concat('loc')).add({
          data:location,
          timestamp:firebase.firestore.FieldValue.serverTimestamp(),
        })    
      }


  // this peice of codes get the countinous location data of the user,
  // which helps in checking the user is travelling or not
      useEffect(() => {
        getloc()
        console.log(count);
        putloc()
      }, [count]);


  // this function pushes the accelerometer and gyroscope data to database according to the current username
      async function putdata(arr1,arr2){
        await db.collection(Collnam).add({
          adata:arr1,
          gdata:arr2,
          timestamp:firebase.firestore.FieldValue.serverTimestamp(),
        })
      }
  


  // the following functions is defined for initialing the sensors, setting up
  // and retriving data from accelerometer and gyroscope

      // accelerometer 
      const _slow = () => {
        Accelerometer.setUpdateInterval(250);
      };

      const _subscribe = () => {
        setSubscription(
          Accelerometer.addListener(accelerometerData => {
            setData(accelerometerData);
            setSyncData(prev => [...prev,accelerometerData])
          })
        );
      };
      
      const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
      };
      
      useEffect(() => {
        _slow()
        _subscribe();
        return () => _unsubscribe();
      }, []);



      // gyroscope
      const _gslow = () => {
        Gyroscope.setUpdateInterval(250);
      };

      const _gsubscribe = () => {
        setgSubscription(
          Gyroscope.addListener(gyroscopeData => {
            setgData(gyroscopeData);
            setgSyncData(prev => [...prev,gyroscopeData])
          })
        );
      };

      const _gunsubscribe = () => {
        gsubscription && gsubscription.remove();
        setgSubscription(null);
      };

      useEffect(() => {
        _gslow()
        _gsubscribe();
        return () => _gunsubscribe();
      }, []);



  // This peice of codes ensures the data integrity sensor data, regulates them by dividing into batches
  // and it is passed to putdata() function, which pushes the data into the database.
      useEffect(()=>{
        if(SyncData.length > 150 && gSyncData.length >150){
          var abatch = []
          var gbatch = []
          setCount(count+1)
          abatch = SyncData.splice(0,50)
          gbatch = gSyncData.splice(0,50)
          putdata(abatch,gbatch)
          abatch = []
          gbatch = []
        }
      },[SyncData,gSyncData])



  const { x, y, z } = data;
  return (
    <View style={{margin:'15%'}}>
      <View><Text>Replace the collection name as : {Collnam}</Text></View>
      <Text style={{fontWeight:'bold'}}>Accelerometer</Text>
      <Text>
        x: {x} 
        </Text>
        <Text>
        y: {y}
        </Text>
        <Text>
         z: {z}
         </Text>
         <Text>
        len : {SyncData.length}
        </Text>
      <View></View>
        <Text style={{fontWeight:'bold'}}>Gyroscope</Text>
        <Text>
          x: {gdata.x}
        </Text> 
        <Text>
          y: {gdata.y} 
        </Text>
        <Text>
          z: {gdata.z}
        </Text>
        <Text>len : {gSyncData.length}</Text>
        <View>
          <Text></Text>
        </View>
        <Text style={{fontWeight:'bold'}}>count: {count}</Text>
        <Text style={{fontWeight:'bold',fontSize:50}}>steps:{stepCount}</Text>
    </View>
  );
    }


    return(
        <NavigationContainer>
           <Stack.Navigator>
            <Stack.Screen
            name='sample login'
            component={Init}
            />
            <Stack.Screen
            name='main'
            component={Main}
            />
            </Stack.Navigator> 
        </NavigationContainer>
    )
}

