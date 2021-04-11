

# In[2]:

import sys,json
import pandas as pd
import numpy as np

import tensorflow as tf

# physical_devices = tf.config.list_physical_devices('GPU')
# tf.config.experimental.set_memory_growth(physical_devices[0], enable=True)


# In[3]:


import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences


# In[4]:


import re
import nltk
nltk.download('punkt')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.preprocessing import OneHotEncoder
from tensorflow.python.types.core import Value


# In[5]:


def load_dataset(filename):
    df = pd.read_csv(filename, encoding = "latin1", names = ["question", "intent"])
    df.dropna()
    #print(df.head())
    intent = df["intent"]
    unique_intent = list(set(intent))
    question = list(df["question"])
    return (intent, unique_intent, question)


# In[6]:


intent, unique_intent, question = load_dataset("data_complete_final.csv")


# In[35]:


#print(question[100:105])
#print(unique_intent)


# In[7]:


def cleaning(question):
    words = []
    for s in question:
        clean = re.sub(r'[^a-z A-Z]', " ", s)
        w = word_tokenize(clean)
        #stemming
        words.append([i.lower() for i in w])
    
    return words  


# In[8]:


cleaned_words = cleaning(question)
#print(len(cleaned_words))


# In[38]:


#print(cleaned_words[:8])


# In[9]:


def create_tokenizer(words, filters = '!"#$%&*+,-./:;<=>?@[\]^`{|}~'):
    token = Tokenizer(filters = filters)
    token.fit_on_texts(words)
    return token


# In[10]:


def max_length(words):
    return(len(max(words, key = len)))


# In[11]:


word_tokenizer = create_tokenizer(cleaned_words)
vocab_size = len(word_tokenizer.word_index) + 1
max_length = max_length(cleaned_words)

#print("Vocab Size = %d and Maximum length = %d" % (vocab_size, max_length))


# In[12]:


def encoding_doc(token, words):
    return(token.texts_to_sequences(words))


# In[15]:


encoded_doc = encoding_doc(word_tokenizer, cleaned_words)


# In[16]:


def padding_doc(encoded_doc, max_length):
    return(pad_sequences(encoded_doc, maxlen = max_length, padding = "post"))


# In[17]:


padded_doc = padding_doc(encoded_doc, max_length)


# In[46]:


#padded_doc[115:118]


# In[47]:


#print("Shape of padded docs = ",padded_doc.shape)


# In[18]:


unique_intent1=['gen_bye', 'spe_credits_get_how', 'spe_alute_purpose', 'gen_fund', 'spe_alute_credits', 'gen_name', 'spe_proj_req_appr', 'spe_admin_who', 'spe_alutoze_get_how', 'gen_who_made', 'spe_alute_acc_free', 'spe_alute_domains', 'spe_proj_limit', 'gen_social_media', 'spe_why_alute', 'spe_alutoze_what', 'gen_who_you', 'gen_query', 'gen_thanks', 'gen_help', 'spe_what_alute_is', 'gen_bot', 'spe_credits_actual_resp', 'gen_how_you', 'gen_contact_info', 'spe_alute_since_when', 'spe_git_why', 'spe_admin_purpose', 'gen_hi', 'spe_proj_own', 'spe_credits_use_how', 'gen_human', 'spe_alutoz_aft_credits', 'spe_data_secure', 'gen_collab']


# In[19]:


output_tokenizer = create_tokenizer(unique_intent1)


# In[50]:


#output_tokenizer.word_index


# In[20]:


encoded_output = encoding_doc(output_tokenizer, intent)


# In[21]:


encoded_output = np.array(encoded_output).reshape(len(encoded_output), 1)


# In[53]:


#encoded_output.shape


# In[22]:


def one_hot(encode):
    o = OneHotEncoder(sparse = False)
    return(o.fit_transform(encode))


# In[23]:


output_one_hot = one_hot(encoded_output)


# In[56]:


#output_one_hot.shape


# In[188]:


model = load_model("test3.h5")


# In[189]:


def predictions(text):
    clean = re.sub(r'[^ a-z A-Z 0-9]'," ", text)
    test_word = word_tokenize(clean)
    test_word = [w.lower() for w in test_word]
    test_ls = word_tokenizer.texts_to_sequences(test_word)
    #print(test_word)            ##
    #Check for unknown words
    if [] in test_ls:
        test_ls = list(filter(None, test_ls))
    
    test_ls = np.array(test_ls).reshape(1, len(test_ls))
 
    x = padding_doc(test_ls, max_length)
  
    pred = model.predict(x)
  
    return pred 


# In[190]:


def get_final_output(pred, classes):
    predictions = pred[0]
 
    classes = np.array(classes)
    ids = np.argsort(-predictions)
    classes = classes[ids]
    predictions = -np.sort(-predictions)
    pred_intent=classes[0]
 
    #for i in range(pred.shape[1]):
     #   print("%s has confidence = %s" % (classes[i], (predictions[i])))
    return pred_intent


# In[191]:


#def user():
#    text=input('Enter your query : ')
#    pred = predictions(text)
#    get_final_output(pred,unique_intent1)


# In[192]:


#user()


# In[193]:


df1=pd.read_csv("responses.csv")


# In[194]:


df1=pd.DataFrame(df1)


# In[195]:


A=list(df1.columns)


# In[196]:


df2=pd.read_csv("suggest_responses.csv")


# In[197]:


df2=pd.DataFrame(df2)


# In[198]:


B=list(df2.columns)


# In[199]:


import random


# In[200]:


#print(random.choice(df1.iloc[:,1]))


# In[201]:


def F1():
    print('bot: ',random.choice(df1.iloc[:,0]))
def F2():
    print('bot: ',random.choice(df1.iloc[:,1]))
def F3():
    print('bot: ',random.choice(df1.iloc[:,2]))
def F4():
    print('bot: ',random.choice(df1.iloc[:,3]))
def F5():
    print('bot: ',random.choice(df1.iloc[:,4]))
def F6():
    print('bot: ',random.choice(df1.iloc[:,5]))
def F7():
    print('bot: ',random.choice(df1.iloc[:,6]))
def F8():
    print('bot: ',random.choice(df1.iloc[:,7]))
def F9():
    print('bot: ',random.choice(df1.iloc[:,8]))
def F10():
    print('bot: ',random.choice(df1.iloc[:,9]))
def F11():
    print('bot: ',random.choice(df1.iloc[:,10]))
def F12():
    print('bot: ',random.choice(df1.iloc[:,11]))
def F13():
    print('bot: ',random.choice(df1.iloc[:,12]))
def F14():
    print('bot: ',random.choice(df1.iloc[:,13]))
def F15():
    print('bot: ',random.choice(df1.iloc[:,14]))
def F16():
    print('bot: ',random.choice(df1.iloc[:,15]))
def F17():
    print('bot: ',random.choice(df1.iloc[:,16]))
def F18():
    print('bot: ',random.choice(df1.iloc[:,17]))
def F19():
    print('bot: ',random.choice(df1.iloc[:,18]))
def F20():
    print('bot: ',random.choice(df1.iloc[:,19]))
def F21():
    print('bot: ',random.choice(df1.iloc[:,20]))
def F22():
    print('bot: ',random.choice(df1.iloc[:,21]))
def F23():
    print('bot: ',random.choice(df1.iloc[:,22]))
def F24():
    print('bot: ',random.choice(df1.iloc[:,23]))
def F25():
    print('bot: ',random.choice(df1.iloc[:,24]))
def F26():
    print('bot: ',random.choice(df1.iloc[:,25]))
def F27():
    print('bot: ',random.choice(df1.iloc[:,26]))
def F28():
    print('bot: ',random.choice(df1.iloc[:,27]))
def F29():
    print('bot: ',random.choice(df1.iloc[:,28]))
def F30():
    print('bot: ',random.choice(df1.iloc[:,29]))
def F31():
    print('bot: ',random.choice(df1.iloc[:,30]))
def F32():
    print('bot: ',random.choice(df1.iloc[:,31]))
def F33():
    print('bot: ',random.choice(df1.iloc[:,32]))
def F34():
    print('bot: ',random.choice(df1.iloc[:,33]))
def F35():
    print('bot: ',random.choice(df1.iloc[:,34]))


# In[203]:


#get_final_output(predictions("Hi"),unique_intent1)


# In[205]:


def G1():
    s=df2.iloc[:,0].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G2():
    s=df2.iloc[:,1].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G3():
    s=df2.iloc[:,2].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G4():
    s=df2.iloc[:,3].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G5():
    s=df2.iloc[:,4].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G6():
    s=df2.iloc[:,5].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G7():
    s=df2.iloc[:,6].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G8():
    s=df2.iloc[:,7].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G9():
    s=df2.iloc[:,8].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G10():
    s=df2.iloc[:,9].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G11():
    s=df2.iloc[:,10].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G12():
    s=df2.iloc[:,11].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G13():
    s=df2.iloc[:,12].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G14():
    s=df2.iloc[:,13].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G15():
    s=df2.iloc[:,14].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G16():
    s=df2.iloc[:,15].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G17():
    s=df2.iloc[:,16].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G18():
    s=df2.iloc[:,17].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G19():
    s=df2.iloc[:,18].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G20():
    s=df2.iloc[:,19].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G21():
    s=df2.iloc[:,20].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G22():
    s=df2.iloc[:,21].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G23():
    s=df2.iloc[:,22].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G24():
    s=df2.iloc[:,23].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G25():
    s=df2.iloc[:,24].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G26():
    s=df2.iloc[:,25].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G27():
    s=df2.iloc[:,26].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G28():
    s=df2.iloc[:,27].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G29():
    s=df2.iloc[:,28].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G30():
    s=df2.iloc[:,29].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G31():
    s=df2.iloc[:,30].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G32():
    s=df2.iloc[:,31].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G33():
    s=df2.iloc[:,32].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G34():
    s=df2.iloc[:,33].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])
def G35():
    s=df2.iloc[:,34].to_list()
    print('bot: ',s[0],'\n','    ',s[1],'\n','    ',s[2])


# In[204]:


def suggest(suggest_query):
    #suggest_query=last_intent[-1]
    if suggest_query == B[0]:
        G1()
    elif suggest_query == B[1]:
        G2()
    elif suggest_query == B[2]:
        G3()
    elif suggest_query == B[3]:
        G4()
    elif suggest_query == B[4]:
        G5()
    elif suggest_query == B[5]:
        G6()
    elif suggest_query == B[6]:
        G7()
    elif suggest_query == B[7]:
        G8()
    elif suggest_query == B[8]:
        G9()
    elif suggest_query == B[9]:
        G10()
    elif suggest_query == B[10]:
        G11()
    elif suggest_query == B[11]:
        G12()
    elif suggest_query == B[12]:
        G13()
    elif suggest_query == B[13]:
        G14()
    elif suggest_query == B[14]:
        G15()
    elif suggest_query == B[15]:
        G16()
    elif suggest_query == B[16]:
        G17()
    elif suggest_query == B[17]:
        G18()
    elif suggest_query == B[18]:
        G19()
    elif suggest_query == B[19]:
        G20()
    elif suggest_query == B[20]:
        G21()
    elif suggest_query == B[21]:
        G22()
    elif suggest_query == B[22]:
        G23()
    elif suggest_query == B[23]:
        G24()
    elif suggest_query == B[24]:
        G25()
    elif suggest_query == B[25]:
        G26()
    elif suggest_query == B[26]:
        G27()
    elif suggest_query == B[27]:
        G28()
    elif suggest_query == B[28]:
        G29()
    elif suggest_query == B[29]:
        G30()
    elif suggest_query == B[30]:
        G31()
    elif suggest_query == B[31]:
        G32()
    elif suggest_query == B[32]:
        G33()
    elif suggest_query == B[33]:
        G34()
    elif suggest_query == B[34]:
        G35()
    else:
        print("Invalid")

    
    


# In[202]:

last_intent=json.loads(sys.argv[2])
def user_output():
    # last_intent=['gen_hi']
 
    text=sys.argv[1]
    # text="hi"
    if text == 'suggest':
        suggest_query=last_intent[-1]
        suggest(suggest_query)
   
        
    elif text == '':
        print("Please enter a valid response") 
    else : 
        pred = predictions(text)
        query=get_final_output(pred, unique_intent1)
        last_intent.append(query)
        if query == A[0]:
            F1()
        elif query == A[1]:
            F2()
        elif query == A[2]:
            F3()
        elif query == A[3]:
            F4()
        elif query == A[4]:
            F5()
        elif query == A[5]:
            F6()
        elif query == A[6]:
            F7()
        elif query == A[7]:
            F8()
        elif query == A[8]:
            F9()
        elif query == A[9]:
            F10()
        elif query == A[10]:
            F11()
        elif query == A[11]:
            F12()
        elif query == A[12]:
            F13()
        elif query == A[13]:
            F14()
        elif query == A[14]:
            F15()
        elif query == A[15]:
            F16()
        elif query == A[16]:
            F17()
        elif query == A[17]:
            F18()
        elif query == A[18]:
            F19()
        elif query == A[19]:
            F20()
        elif query == A[20]:
            F21()
        elif query == A[21]:
            F22()
        elif query == A[22]:
            F23()
        elif query == A[23]:
            F24()
        elif query == A[24]:
            F25()
        elif query == A[25]:
            F26()
        elif query == A[26]:
            F27()
        elif query == A[27]:
            F28()
        elif query == A[28]:
            F29()
        elif query == A[29]:
            F30()
        elif query == A[30]:
            F31()
        elif query == A[31]:
            F32()
        elif query == A[32]:
            F33()
        elif query == A[33]:
            F34()
        elif query == A[34]:
            F35()
        else:
            print("Please enter a valid response")

    print((last_intent[-1]))


# In[206]:


# get_final_output(predictions("Hi"),unique_intent1)
user_output()

# In[ ]:





# In[ ]:





# In[ ]:




