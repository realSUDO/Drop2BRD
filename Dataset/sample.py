import pandas as pd

# create detailed logs for eah step of the process
#list files in current directory 
print("Listing files in the current directory...")
import os
print(os.listdir("."))  
print("Creating a sample of the dataset...")
df = pd.read_csv("emails.csv", nrows=1000)
df.to_csv("emails_sample.csv", index=False)
