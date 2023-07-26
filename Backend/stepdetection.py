'''
**************************************
Step Detection - Pedometer Algorithm
**************************************
'''

import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from scipy.signal import lfilter, find_peaks

# database
import firebase_admin
from firebase_admin import credentials, firestore

# initialisation of database
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()  # this connects to our Firestore database

final = 0

db.collection('presentation'+'count').document('count').set({
    'count': final
})


plt.style.use('classic')
final = 0
gyrosum = 0

# this function does all the process and changes to the graph plotted
def animate(i):
    data = pd.read_csv('data.csv')  #data in the csv file written is read 

    x = data['sn'] # TIME

    # USING ACCELEROMETER VALUES
    y1 = data['ax']
    y2 = data['ay']
    y3 = data['az']

    # noise reduction filter is applied to the graph before plotting
    n = 13  # the larger n is, the smoother curve will be
    b = [1.0 / n] * n
    a = 1

    # plotting and peak detection process 
 
    thres = 0.35    # threshold is given (variable value)
    plt.axhline(y=thres, color='r', linestyle='dashed', label="red line") #threshold line is plotted for visualization 
    
    yy1 = lfilter(b, a, y1) # noise reduction filter is applied to the respective values
    plt.plot(x, yy1, linewidth=2, linestyle="-", c="b")  # smooths by filter

    yy2 = lfilter(b, a, y2)
    plt.plot(x, yy2, linewidth=2, linestyle="-", c="g")  # smooths by filter

    yy3 = lfilter(b, a, y3)
    plt.plot(x, yy3, linewidth=2, linestyle="-", c="r")  # smooths by filter

    peaks, height_array = find_peaks(yy3, height=thres) #peaks above the given threshold value in the respective graph line is found
    plt.plot(peaks, yy3[peaks], "x", color="gray")  # peaks are plotted
    peaks_length = len(peaks) #peaks are counted



    # USING GYROSCOPE VALUES
    gy1 = data['gx']
    gy2 = data['gy']
    gy3 = data['gz']

    # same process as done for acceleromter graph
    gyy1 = lfilter(b, a, gy1) # noise reduction filter is applied
    plt.plot(x, gyy1, linewidth=0.5, linestyle="-", c="y")  # smooth by filter

    gyy2 = lfilter(b, a, gy2)
    plt.plot(x, gyy2, linewidth=0.5, linestyle="-", c="y")  # smooth by filter

    gyy3 = lfilter(b, a, gy3)
    plt.plot(x, gyy3, linewidth=0.5, linestyle="-", c="y")  # smooth by filter


    thres1 = 4 # threshold is set a bit high as only high peaks and troughs from gyroscope values will denote lateral movements
    # threshold axis is plotted
    plt.axhline(y=thres1, color='r', linestyle='dashed', label="blue line")
    plt.axhline(y=-thres1, color='b', linestyle='dashed', label="blue line")

    # peaks and troughs are calculated
    peaksy1, height_array = find_peaks(gyy1, height=thres1) 
    peaksyy1, height_array = find_peaks(-gyy1, height=thres1) # troughs are calculated by -ve of finsding peak method
    peaksy2, height_array = find_peaks(gyy2, height=thres1)
    peaksyy2, height_array = find_peaks(-gyy2, height=thres1)
    peaksy3, height_array = find_peaks(gyy3, height=thres1)
    peaksyy3, height_array = find_peaks(-gyy3, height=thres1)



    # to mark and visualize peaks plotted use this --> plt.plot(peaks<y1,yy1,y2,yy2,...>, yy1[peaks<y1,yy1,y2,yy2,...>], "x", color="gray")

    peaks_lengthy1 = len(peaksy1) # total length of the respective peak list is initialized
    peaks_lengthyy1 = len(peaksyy1)
    peaks_lengthy2 = len(peaksy2)
    peaks_lengthyy2 = len(peaksyy2)
    peaks_lengthy3 = len(peaksy3)
    peaks_lengthyy3 = len(peaksyy3)

    gyrosum = peaks_lengthy1 + peaks_lengthyy1 + peaks_lengthy2 + peaks_lengthyy2 + peaks_lengthy3 + peaks_lengthyy3 #sum of the peaks is calculated as lateral movements in any direction is counted
    if gyrosum < peaks_length:
        final = peaks_length - gyrosum  #actual peaks from acceleromter values are subtracted from gyroscope values as they were calculated by lateral movements
    else:
        final = peaks_length

    print(final)    # final step count is calculated
    
    

    db.collection('presentation'+'count').document('count').update({
        'count': final
    })

# print(count1)


ani = FuncAnimation(plt.gcf(), animate, interval=1000) # the animate function is called in an interval of 1000ms 

# interval value is customisable(can be reduced according to the need)

plt.tight_layout()
plt.show() # to display the plotted graph window
