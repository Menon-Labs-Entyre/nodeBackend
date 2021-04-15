import sys
import json

def test_hello():
    print('Hello from the python file\n')

def test_receive_diagnosis(diagnosis):
    print('Stringified input received: %s\n' % diagnosis)

def test_parse_diagnosis(diagnosis):
    data = json.loads(diagnosis)
    for entry in data:
        print(entry['diagnosis'])
    
def test(diagnosis):
    test_hello()
    test_receive_diagnosis(diagnosis)
    test_parse_diagnosis(diagnosis)
    
if __name__ =='__main__' :
    test(sys.argv[1])
