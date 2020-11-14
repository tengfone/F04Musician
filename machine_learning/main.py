import sys


# For now just takes in an argument and returns the argument (String)

def main(argv):
    print(argv)

if __name__ == "__main__": 
    main(sys.argv[1:])