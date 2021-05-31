import tweepy

CONSUMER_KEY = "oa2a9ZqCa43Mh2aUQZEdkeLLR"
CONSUMER_SECRET = "kLsSgCF7J9uf9irdws6kTCdNlPwWsz4LYL75JnHgDgjfEfNowG"

ACCESS_KEY = "3144917546-bYv0MP3t4MLsCb5ZbBvI3G9a5CNc6LMPETRCL9r"
ACCESS_SECRET = "Zs9CvaTMxdvWoFDrBl5FsS7UsaZDriYMgMTkq8L2lrrzJ"


auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)

api = tweepy.API(auth, wait_on_rate_limit=True, wait_on_rate_limit_notify=True)

# public_tweets = api.home_timeline()
# for tweet in public_tweets:
#     print(tweet.text)

bsindia = api.get_user('bsindia');
print(bsindia.screen_name);
print(bsindia.followers_count);

tweets = api.search("(from:bsindia)", count = 5, until = "2020-08-16")
for status in tweepy.Cursor(api.search, q="(from:bsindia)", count = 5).items(5):
    print(status.text)