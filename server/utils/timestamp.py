from time import time


def current():
    timestamp = int(time() * 1000000)
    return timestamp
