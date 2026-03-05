import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import java.util.Arrays;

public class TestApp {
    public static void main(String[] args) {
        try {
            Message systemMsg = Message.builder().role(Role.SYSTEM.getValue()).content("you are AI").build();
            Message userMsg = Message.builder().role(Role.USER.getValue()).content("hello").build();

            System.out.println("Building param...");
            GenerationParam param = GenerationParam.builder()
                    .apiKey("ENC(K+73iSEfOLfrEMWPy50xvw3vjlzHNoTXHW8uDUbRj22lOxylGk8bRqfwfmy58qWJ)")
                    .model("qwen-turbo")
                    .messages(Arrays.asList(systemMsg, userMsg))
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .build();

            System.out.println("Calling generation...");
            Generation gen = new Generation();
            gen.call(param);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
