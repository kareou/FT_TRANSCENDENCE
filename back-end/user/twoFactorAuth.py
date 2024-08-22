import pyotp
import qrcode

secret =  pyotp.random_base32()

def generate_qr(username, issuer):
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=username, issuer_name=issuer)
    img = qrcode.make(uri)
    img.save('./media/2fa/'+username+'_2fa.png')

def generate_otp(time):
    totp = pyotp.TOTP(secret, interval=time)
    return totp.now()

def verify_otp(code):
    return pyotp.TOTP(secret).verify(code)
