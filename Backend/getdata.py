import time
import firebase_admin
from firebase_admin import credentials, firestore
import json

# serviceAccountKey.json contains the database credentials,
# with which we are initializing the connection to database

# <----database connectivity---->
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()  # this connects to our Firestore database
# <----database connectivity---->

ele = {}
eleloc = {}
f = open('data.csv', "w")
f.write("sn,ax,ay,az,gx,gy,gz\n")
global cou
cou = -1


# this callback is called once a change is occured in the database,
# it fetches the latest added data and filters the unwanted data and
# writes into the csv file.
def on_snapshot(doc_snapshot, changes, read_time):
    global cou
    ele = doc_snapshot[-1].to_dict()
    cou = cou + 1
    print('data')
    del ele['timestamp']
    data = zip(ele['adata'], ele['gdata'])
    for index, d in enumerate(data):
        i, j = d
        f.write("{},{},{},{},{},{},{}\n".format(
            cou*50 + index, i['x'], i['y'], i['z'], j['x'], j['y'], j['z']))


# this snippet of code continuously listen to changes in the database,
# once the change ois detected this id executed ,i.e the callback function is called.
# the records from the database is ordered by time in which the record is created.
doc_ref = db.collection('presentation').order_by(
    'timestamp', direction=firestore.Query.DESCENDING)
doc_watch = doc_ref.on_snapshot(on_snapshot)


# Keeps the program alive by running continuously
while True:
    time.sleep(1)
    print('processing...')
