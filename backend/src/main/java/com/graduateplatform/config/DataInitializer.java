package com.graduateplatform.config;

import com.graduateplatform.entity.*;
import com.graduateplatform.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PostCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final QuestionBankRepository bankRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(PostCategoryRepository categoryRepository, UserRepository userRepository,
                           QuestionBankRepository bankRepository, PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.bankRepository = bankRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initCategories();
        initUsers();
        initQuestionBanks();
    }

    private void initCategories() {
        if (categoryRepository.count() > 0) return;

        String[][] data = {
            {"kaoyan", "考研", "考研相关讨论与资料"},
            {"kaogong", "考公考编", "公务员及事业单位考试"},
            {"job", "就业", "校招与求职信息"},
            {"liuxue", "留学", "留学申请与经验"},
            {"experience", "经验分享", "各类备考与求职经验"},
            {"resource", "资料互助", "学习资料共享与下载"},
        };

        for (int i = 0; i < data.length; i++) {
            categoryRepository.save(PostCategory.builder()
                .code(data[i][0]).name(data[i][1]).description(data[i][2])
                .sortOrder(i).active(true).build());
        }
    }

    private void initUsers() {
        if (userRepository.count() > 0) return;

        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);

        User admin = userRepository.save(User.builder()
            .name("管理员").email("admin@graduate.local")
            .password(passwordEncoder.encode("admin123"))
            .target("kaoyan").role("admin").status("normal").build());
        admin.setCreatedAt(thirtyDaysAgo);
        userRepository.save(admin);

        User testUser = userRepository.save(User.builder()
            .name("测试用户").email("test@graduate.local").phone("13800138000")
            .password(passwordEncoder.encode("test1234"))
            .school("上海理工大学").major("计算机科学").grade("2023级")
            .target("kaoyan").role("user").status("normal").build());
        testUser.setCreatedAt(thirtyDaysAgo);
        userRepository.save(testUser);
    }

    private void initQuestionBanks() {
        if (bankRepository.count() > 0) return;

        createBank("考研政治题库", "kaoyan", "政治", "涵盖马原、毛中特、史纲、思修", "middle",
            new String[][]{
                {"马克思主义哲学认为，世界的统一性在于它的", "[\"A.客观实在性\",\"B.物质性\",\"C.可知性\",\"D.矛盾性\"]", "B", "辩证唯物主义认为世界统一于物质。"},
                {"商品的二因素是", "[\"A.使用价值和价值\",\"B.具体劳动和抽象劳动\",\"C.私人劳动和社会劳动\",\"D.简单劳动和复杂劳动\"]", "A", "商品是使用价值和价值的统一体。"},
                {"毛泽东思想活的灵魂是", "[\"A.武装斗争\",\"B.实事求是\",\"C.群众路线\",\"D.独立自主\"]", "B", "实事求是、群众路线、独立自主是毛泽东思想活的灵魂。"},
                {"五四运动发生在哪一年", "[\"A.1917年\",\"B.1918年\",\"C.1919年\",\"D.1920年\"]", "C", "五四运动发生于1919年5月4日。"},
                {"社会主义初级阶段的基本经济制度是", "[\"A.公有制为主体\",\"B.多种所有制经济共同发展\",\"C.公有制为主体、多种所有制经济共同发展\",\"D.按劳分配为主体\"]", "C", "公有制为主体、多种所有制经济共同发展是我国基本经济制度。"},
            });

        createBank("考研英语题库", "kaoyan", "英语", "词汇、阅读、翻译与写作", "middle",
            new String[][]{
                {"The professor ___ the lecture with a summary.", "[\"A.concluded\",\"B.included\",\"C.excluded\",\"D.secluded\"]", "A", "conclude 意为\"结束，总结\"，符合句意。"},
                {"She is ___ student in her class.", "[\"A.the most diligent\",\"B.more diligent\",\"C.most diligent\",\"D.diligent\"]", "A", "表示三者以上比较用最高级，且形容词最高级前加the。"},
                {"I look forward to ___ from you.", "[\"A.hear\",\"B.hearing\",\"C.heard\",\"D.be heard\"]", "B", "look forward to + 动名词(doing)。"},
                {"Not until yesterday ___ the truth.", "[\"A.did he know\",\"B.he knew\",\"C.he did know\",\"D.knew he\"]", "A", "Not until放句首，主句用部分倒装。"},
                {"The meeting ___ next Monday has been cancelled.", "[\"A.held\",\"B.being held\",\"C.to be held\",\"D.having held\"]", "C", "不定式作定语表示将来。"},
            });

        createBank("行测题库", "kaogong", "行测", "言语理解、数量关系、判断推理", "middle",
            new String[][]{
                {"从下列选项中选出最合适的一项填入问号处：2, 4, 8, 16, ?", "[\"A.24\",\"B.28\",\"C.32\",\"D.36\"]", "C", "等比数列，公比为2。"},
                {"甲、乙两人从相距36千米的两地相向而行，甲的速度为4km/h，乙的速度为5km/h，几小时后两人相遇？", "[\"A.3小时\",\"B.3.5小时\",\"C.4小时\",\"D.4.5小时\"]", "C", "相遇时间=总路程/(速度和)=36/(4+5)=4小时。"},
                {"以下哪项不属于行政诉讼的受案范围？", "[\"A.对罚款不服\",\"B.对行政拘留不服\",\"C.对国防外交等国家行为不服\",\"D.对吊销许可证不服\"]", "C", "国防、外交等国家行为不属于行政诉讼受案范围。"},
                {"某商品进价100元，按150元出售，利润率为多少？", "[\"A.30%\",\"B.40%\",\"C.50%\",\"D.60%\"]", "C", "利润率=(售价-进价)/进价=(150-100)/100=50%。"},
                {"下列词语中，没有错别字的一项是", "[\"A.不径而走\",\"B.一愁莫展\",\"C.再接再励\",\"D.脍炙人口\"]", "D", "A应为\"不胫而走\"，B应为\"一筹莫展\"，C应为\"再接再厉\"。"},
            });

        createBank("申论题库", "kaogong", "申论", "归纳概括、提出对策、综合分析", "hard",
            new String[][]{
                {"申论考试中，归纳概括题的核心要求是", "[\"A.全面、准确、简明\",\"B.生动、形象、具体\",\"C.华丽、优美、动人\",\"D.复杂、深奥、晦涩\"]", "A", "归纳概括题强调全面、准确、简明。"},
                {"公文写作中，请示的结束语正确的是", "[\"A.妥否，请批示\",\"B.多谢合作\",\"C.祝工作顺利\",\"D.以上通知，请遵守\"]", "A", "请示的规范结束语为\"妥否，请批示\"或\"请批复\"。"},
                {"提出对策题在作答时，措施应具备", "[\"A.针对性、可行性、操作性\",\"B.理论性、抽象性、理想性\",\"C.随意性、主观性、模糊性\",\"D.复杂性、难懂性、空泛性\"]", "A", "对策题要求措施具有针对性、可行性和可操作性。"},
                {"综合分析题中，分析原因的常见维度不包括", "[\"A.思想观念层面\",\"B.制度机制层面\",\"C.经济社会发展层面\",\"D.个人好恶层面\"]", "D", "综合分析应从客观维度分析原因，个人好恶不够客观。"},
                {"申论文章的论证方法中，类比论证属于", "[\"A.事实论证\",\"B.道理论证\",\"C.比喻论证\",\"D.对比论证\"]", "C", "类比论证是比喻论证的一种形式。"},
            });
    }

    private void createBank(String name, String target, String subject, String desc, String difficulty, String[][] questions) {
        QuestionBank bank = QuestionBank.builder()
            .name(name).target(target).subject(subject).description(desc).difficulty(difficulty)
            .build();

        for (int i = 0; i < questions.length; i++) {
            String[] q = questions[i];
            bank.getQuestions().add(Question.builder()
                .stem(q[0]).optionsJson(q[1]).answer(q[2]).analysis(q[3])
                .chapter("第" + (i + 1) + "章").difficulty(difficulty).bank(bank).active(true)
                .build());
        }

        bankRepository.save(bank);
    }
}
