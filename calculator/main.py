def add(x, y):
  return x + y

def subtract(x, y):
  return x - y

def multiply(x, y):
  return x * y

def divide(x, y):
  if y == 0:
    return 'Error: Division by zero'
  else:
    return x / y

print('Simple Calculator')
print('1. Addition')
print('2. Subtraction')
print('3. Multiplication')
print('4. Division')
choice = '2'
num1 = 10.0
num2 = 5.0
if choice in ('1', '2', '3', '4'):
  if choice == '1':
    print(num1, '+', num2, '=', add(num1, num2))
  elif choice == '2':
    print(num1, '-', num2, '=', subtract(num1, num2))
  elif choice == '3':
    print(num1, '*', num2, '=', multiply(num1, num2))
  elif choice == '4':
    result = divide(num1, num2)
    print(num1, '/', num2, '=', result)
else:
  print('Invalid input')