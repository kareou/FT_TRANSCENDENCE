import os
import pyotp
import qrcode

secret =  pyotp.random_base32()


def generate_qr(username, issuer):
    # Ensure the media and 2fa directories exist
    base_directory = './media'
    twofa_directory = os.path.join(base_directory, '2fa')
    
    if not os.path.exists(twofa_directory):
        os.makedirs(twofa_directory)
    
    # Generate the QR code
    secret = pyotp.random_base32()  # Ensure you have a secret key
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=username, issuer_name=issuer)
    img = qrcode.make(uri)
    img.save(os.path.join(twofa_directory, f'{username}_2fa.png'))

def generate_otp(time):
    totp = pyotp.TOTP(secret, interval=time)
    return totp.now()

def verify_otp(code):
    return pyotp.TOTP(secret).verify(code)
