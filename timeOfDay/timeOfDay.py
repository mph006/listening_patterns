import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('/data/user1.csv', index_col='timestamp', parse_dates=True)

# need floats not strings
df.song_tempo = pd.to_numeric(df.song_tempo, errors='coerce')
df.danceability_score = pd.to_numeric(df.danceability_score, errors='coerce')

df['timeofday'] = pd.to_datetime(df.index, unit='s').hour
df.plot(kind='scatter', x='timeofday', y='energy')
plt.show()