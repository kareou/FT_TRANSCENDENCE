from rest_framework_simplejwt import authentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken

# override the default JWT authentication class
class CustomJWTAuthentication(authentication.JWTAuthentication):
    # override the method to get the raw token from the cookie instead of the Authorization header
    def get_raw_token(self, request):
        return request.COOKIES.get('access')

    # override the method to remove the get_header method call that tries to get the token from the Authorization header since we are getting it from the cookie
    def authenticate(self, request):
        raw_token = self.get_raw_token(request)
        if raw_token is None:
            return None

        try:
            validated_token = UntypedToken(raw_token)
        except (InvalidToken, TokenError):
            return None

        return (self.get_user(validated_token), raw_token)