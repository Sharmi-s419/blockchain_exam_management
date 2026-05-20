from rest_framework import serializers
from .models import User, Exam, Question, ExamRegistration, ExamAttempt
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    registered_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    is_attempted = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = '__all__'

    def get_registered_count(self, obj):
        return obj.registrations.count()

    def get_is_registered(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return obj.registrations.filter(user=user).exists()
        return False

    def get_is_attempted(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return obj.attempts.filter(user=user).exists()
        return False

class ExamRegistrationSerializer(serializers.ModelSerializer):
    exam_details = ExamSerializer(source='exam', read_only=True)
    class Meta:
        model = ExamRegistration
        fields = '__all__'

class ExamAttemptSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)

    class Meta:
        model = ExamAttempt
        fields = '__all__'
