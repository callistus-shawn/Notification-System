import sqlite3
conn=sqlite3.connect('notif.db')
c=conn.cursor()
c.execute("""CREATE TABLE notifications(
         notifications text,
         action text          
           )""")

conn.commit()
conn.close()
