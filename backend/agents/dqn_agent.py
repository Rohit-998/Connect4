import numpy as np
import random
from collections import deque
import tensorflow as tf
from tensorflow import keras
from keras import layers




def build_model():

    model = keras.Sequential([
        layers.Input(shape=(6,7,1)),
        layers.Conv2D(32,kernel_size=3 , padding='same' , activation='relu'),
        layers.Conv2D(64,kernel_size=3 , padding='same' , activation='relu'),
        layers.Conv2D(64,kernel_size=3 , padding='same' , activation='relu'),
        layers.Flatten(),
        layers.Dense(512 , activation='relu'),
        layers.Dense(7)
    ])
    return model


class ReplayBuffer:
    def __init__(self,capacity):
        self.buffer = deque(maxlen=capacity)

    def push(self,state , action ,reward , next_state ,done):
        self.buffer.append((state , action ,reward , next_state ,done))

    def sample(self,batch_size):
        batch = random.sample(self.buffer , batch_size)
        states , actions ,rewards , next_states ,dones=zip(*batch)
        return(
            np.array(states),
            np.array(actions),
            np.array(rewards , dtype=np.float32),
            np.array(next_states),
            np.array(dones , dtype=np.float32),
        )
    def __len__(self):
        return len(self.buffer)


class DQNAgent:
    def __init__(self,lr=0.001 , gamma = 0.99 , epsilon=1.0,epsilon_min=0.05 , epsilon_decay=0.9995,buffer_size=50000 , batch_size=64):
        self.policy_net=build_model()
        self.target_net=build_model()
        self.target_net.set_weights(self.policy_net.get_weights())

        self.optimizer=keras.optimizers.Adam(learning_rate=lr)
        self.loss_fn = keras.losses.MeanSquaredError()
        self.memory=ReplayBuffer(buffer_size)

        self.gamma=gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.batch_size = batch_size

    def select_action(self,state,valid_moves):
        if random.random()<self.epsilon:
            return random.choice(valid_moves)

        state_tensor = np.array(state, dtype=np.float32).reshape(1,6,7,1)
        q_values = self.policy_net(state_tensor, training=False).numpy()[0]

        for col in range(7):
            if col not in valid_moves:
                q_values[col] = -np.inf
        return int(np.argmax(q_values))

    def train_step(self):
        if len(self.memory)<self.batch_size:
            return

        states,actions,rewards,next_states,dones=self.memory.sample(self.batch_size)
        states=states.reshape(-1,6,7,1)
        next_states=next_states.reshape(-1,6,7,1)
        future_q=self.target_net(next_states, training=False).numpy()
        max_future_q = np.max(future_q,axis=1)
        targets=rewards+self.gamma * max_future_q*(1-dones)

        with tf.GradientTape() as tape:
            all_q = self.policy_net(states,training=True)
            action_masks = tf.one_hot(actions,7)
            predicted_q=tf.reduce_sum(all_q*action_masks,axis=1)
            loss = self.loss_fn(targets,predicted_q)

        grads = tape.gradient(loss,self.policy_net.trainable_variables)
        self.optimizer.apply_gradients(zip(grads,self.policy_net.trainable_variables))
        
        if self.epsilon>self.epsilon_min:
            self.epsilon*=self.epsilon_decay

        

    def update_target_network(self):
        self.target_net.set_weights(self.policy_net.get_weights())

    def save(self,path):
        self.policy_net.save_weights(path)
        
    def load(self,path):
        self.policy_net.load_weights(path)
        self.target_net.set_weights(self.policy_net.get_weights())


# ============================================================
# Heavy model architecture (for self-play trained checkpoints)
# ============================================================
def build_heavy_model():
    inputs = layers.Input(shape=(6, 7, 1))

    x = layers.Conv2D(128, kernel_size=3, padding='same')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.ReLU()(x)

    x = layers.Conv2D(128, kernel_size=3, padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.ReLU()(x)

    skip = x
    x = layers.Conv2D(256, kernel_size=3, padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.ReLU()(x)
    x = layers.Conv2D(128, kernel_size=3, padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Add()([x, skip])
    x = layers.ReLU()(x)

    x = layers.Conv2D(256, kernel_size=3, padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.ReLU()(x)

    x = layers.Flatten()(x)
    x = layers.Dense(1024, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(512, activation='relu')(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(7)(x)

    return keras.Model(inputs=inputs, outputs=outputs)


class HeavyDQNAgent:
    """Agent using the larger self-play trained model."""
    def __init__(self):
        self.policy_net = build_heavy_model()
        self.epsilon = 0

    def select_action(self, state, valid_moves):
        if random.random() < self.epsilon:
            return random.choice(valid_moves)

        state_tensor = np.array(state, dtype=np.float32).reshape(1, 6, 7, 1)
        q_values = self.policy_net(state_tensor, training=False).numpy()[0]

        for col in range(7):
            if col not in valid_moves:
                q_values[col] = -np.inf
        return int(np.argmax(q_values))

    def load(self, path):
        self.policy_net.load_weights(path)