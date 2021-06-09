#!/usr/bin/python
# -*- coding: utf-8 -*-
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Dense, Dropout, LSTM, Embedding, Input
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import LeakyReLU
from flask_cors import CORS, cross_origin
import string
import validators
import numpy as np
from flask import Flask, jsonify, request
import pickle
import pandas as pd
from random import randint
import urllib.request, json 

def create_model(input_length,batch_size,vocab_size):
    iplayer = Input(shape=(input_length))
    embed = Embedding(vocab_size,300,input_length=input_length)(iplayer)
    out = LSTM(256, input_shape = (None,input_length-1+1,300),dropout=0.2, recurrent_dropout=0.2)(embed)
    out = LeakyReLU()(out)
    out = Dense(2048)(out)
    out = Dropout(0.25)(out)
    out = LeakyReLU()(out)
    out = Dense(1,activation='sigmoid')(out)
    model = Model(inputs=[iplayer],outputs = out)
    return model
BATCH_SIZE = 32
input_length = 53#cap_vector[0].shape[0]
model = create_model(input_length,BATCH_SIZE,5000)
model.load_weights("model.05-0.39.h5")
stock_model = load_model("stock_price.h5")

def Process_tweet(tweet):
  tweet = tweet.replace("n't"," not").replace("'m"," am").replace("'ve"," have").replace("’","'").replace('`','').replace("(","").replace(")","")
  tweet = tweet.split()
  alphabets = "qwertyuioplkjhgfdsazxcvbnm"
  tweet = [w.lower() for w in tweet if w[0] not in string.punctuation and not validators.url(w) and w[0] in alphabets]
  tweet = [w for w in tweet if not any(x in string.punctuation or x.isdigit() for x in w)]
  out = []
  for i in range(0,len(tweet)):
    out.append(tweet[i])
  return out
with open('tokenizer_file.pkl', 'rb') as handle:
    tokenizer = pickle.load(handle)

tweets = pd.read_csv("ct.csv")
app = Flask(__name__)
cors = CORS(app)
print("ready")

@app.route('/predict', methods=['POST'])
@cross_origin()
def predict():
    if request.method == 'POST':
        content = request.get_json()
        app.logger.info(content)
        example = str(content.get('tweet')).lower()
        example = Process_tweet(example)
        example = tokenizer.texts_to_sequences([example])
        example_vector = pad_sequences(example, padding='post',maxlen=53)
        example_vector = np.reshape(example_vector,(1,53,1))
        output = str(model.predict([example_vector])[0][0])
    return jsonify({'output': output})

@app.route('/stockprice', methods=['POST'])
@cross_origin()
def stock():
    if request.method == 'POST':
        content = request.get_json()
        app.logger.info(content)
        symbol = str(content.get('symbol')).upper()
        with urllib.request.urlopen("https://query1.finance.yahoo.com/v8/finance/chart/"+symbol+".NS?range=1y&interval=1d") as url:
            data = json.loads(url.read().decode())
            arr = data['chart']['result'][0]['indicators']['quote'][0]['close']
            arr = np.array(arr,dtype = 'float32').reshape(len(arr),1)
            actual = arr[-5:]
            arr = arr[-65:-5]
        mea = np.mean(arr)
        arr = arr/mea-1
        pred = arr
        arr = np.reshape(arr,(1,60,1))
        for _ in range(15):
            prediction = stock_model.predict([arr])
            pred = np.append(pred,prediction)
            for j in range(59):
                arr[0][j] = arr[0][j+1]
            arr[0][-1][0] = prediction
        pred = (pred+1)*mea
        pred = np.reshape(pred,(75,))
        pred = pred[-15:]
        output = pred.tolist()
        actual = np.reshape(actual,(5,))
    return jsonify({'output': output, 'actual':actual.tolist()})

@app.route('/gettweet', methods=['POST'])
@cross_origin()
def getTweet():
    if request.method == 'POST':
        i = randint(0,len(tweets)-1)
        t = tweets.iloc[i]
        output_id = t['id']
        output_content = t['content']
        output_url = t['url']
    return jsonify({'id': output_id,'content': output_content,'url': output_url})

@app.route('/getntweet', methods=['POST'])
@cross_origin()
def getNTweet():
    if request.method == 'POST':
        content = request.get_json()
        n = str(content.get('n')).upper()
        # i = randint(0,len(tweets)-1)
        t = tweets.sample(n=int(n))
        output_id = t['id'].tolist()
        output_content = t['content'].tolist()
        output_url = t['url'].tolist()
    return jsonify({'id': output_id,'content': output_content,'url': output_url})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

