import tweepy
import socket
import json
import os


# override class to change behaviour when tweets are streamed
class MyStreamListener(tweepy.StreamListener):

    socket_conn = None

    def on_status(self, status):
        if status.geo:
            # print(status.geo)
            # print(status.text)
            send_data(MyStreamListener.socket_conn, status.geo)

    def on_error(self, status_code):
        if status_code == 420:
            print("Rate limit has been reached. Stream disconnected.")
            return False


def authenticate(con_key, con_secret, acc_token, acc_token_secret):
    """
    Authenticates the application using Twitter's credentials. To register an
    application go to: https://apps.twitter.com/

    :param con_key:             consumer key
    :param con_secret:          consumer secret
    :param acc_token:           access token
    :param acc_token_secret:    access token secret
    :return:                    tweepy API object
    """

    auth = tweepy.OAuthHandler(con_key, con_secret)
    auth.set_access_token(acc_token, acc_token_secret)
    return tweepy.API(auth)


def stream_tweets(api, conn, keywords, locations=None):
    """
    Streams tweeters given specific keywords and locations
    :param api:         tweepy API object
    :param conn:        socket connection
    :param keywords:    tweeter keywords to filter
    :param locations:   locations to filter
    :return:            None

    """

    stream_listener = MyStreamListener()
    MyStreamListener.socket_conn = conn
    stream = tweepy.Stream(auth=api.auth, listener=stream_listener)
    stream.filter(track=keywords, locations=locations)


def setup_server(host, port):
    """
    Setups a sever by creating a socket and binding it to the specified host
    and port.
    :param host:    host
    :param port:    port
    :return:        socket
    """

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print("Socket created...")

    try:
        s.bind((host, port))
        print("Socket bound...")
    except socket.error as msg:
        print(msg)

    return s


def setup_connection(s):
    """
    Connects to client.
    :param s: socket
    :return:  connection
    """

    s.listen(1)
    connection, address = s.accept()
    print(f"Connected to {address[0]}, {address[1]}")

    return connection


def send_data(connection, data):
    """
    Send specific data through the socket
    :param connection:  socket connection
    :param data:        data to be sent through the socket
    :return:            None
    """

    data = json.dumps(data)
    connection.sendall(data.encode("utf-8"))


if __name__ == "__main__":

    # credentials
    con_key = os.environ.get('TW_CONSUMER_KEY')
    con_secret = os.environ.get('TW_CONSUMER_SECRET')
    acc_token = os.environ.get('TW_ACCESS_TOKEN')
    acc_token_secret = os.environ.get('TW_ACCESS_TOKEN_SECRET')

    # specify keywors and locations
    keywords = ['web']
    locations = [-180, -90, 180, 90]

    # socket parameters
    host = ""
    port = 5560

    s = setup_server(host, port)
    api = authenticate(con_key, con_secret, acc_token, acc_token_secret)

    conn = setup_connection(s)
    stream_tweets(api, conn, keywords, locations)

